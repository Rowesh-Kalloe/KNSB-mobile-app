import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import {
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  X,
  Database,
  Trophy,
} from 'lucide-react-native';
import skatingData from '@/assets/data/skating_results_data.json';
// import { SkatingAPI } from '@/services/api';
import { SkatingAPI } from '@/services/api';

interface Result {
  id: number;
  position: number;
  name: string;
  time: string;
  ansTime: string;
  change: number;
  date: string;
  track: string;
  category: string;
  geslachten: string;
  level: string;
  distance: number;
  person_id?: number;
}

interface SeasonBestTime {
  distance: number;
  ans_time: number;
  city: string;
}

interface FilterOption {
  value: string;
  label: string;
  gender?: string;
  level?: string;
}

export default function RankingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Animation values for modals
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.95);
  const toolbarOpacity = useSharedValue(0);
  const toolbarTranslateY = useSharedValue(20);

  const [selectedSkater, setSelectedSkater] = useState<Result | null>(null);
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [skaterSeasonTimes, setSkaterSeasonTimes] = useState<SeasonBestTime[]>([]);
  const [loadingSkaterTimes, setLoadingSkaterTimes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedTimeRow, setSelectedTimeRow] = useState<SeasonBestTime | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  
  const [filters, setFilters] = useState({
    distance: '500',
    season: '2024',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  const resultsPerPage = 20;

  // Initialize component
  useEffect(() => {
    loadResults();
  }, [filters.distance, filters.season]); // Re-fetch when data selection filters change

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Send current filter values to API to see if it can filter server-side
      const response = await SkatingAPI.getRaces({
        distance: filters.distance,
        season: filters.season,
        gender: filters.geslachten !== 'all' ? filters.geslachten : undefined,
        level: filters.level !== 'all' ? filters.level : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        track: filters.track !== 'all' ? filters.track : undefined
      });
      
      if (response && Array.isArray(response)) {
        // Convert times from milliseconds to MM:SS.xx format and add positions
        const processedResults = response.map((item, index) => ({
          id: item.id || index + 1,
          position: index + 1,
          name: item.name || 'Onbekend',
          time: item.time || '',
          ansTime: formatMillisecondsToTime(item.ans_time || 0),
          change: item.change || 0,
          date: item.date || '',
          track: item.code || item.city || item.track || item.baan || '',
          category: item.cat || item.category || item.categorie || '',
          geslachten: item.gender || item.geslachten || '',
          level: item.level || '',
          distance: parseInt(filters.distance) || 500,
          person_id: item.person_id || 0
        }));
        
        console.log('Processed results sample:', processedResults[0]);
        setResults(processedResults);
      } else {
        console.warn('Unexpected API response format:', response);
        setResults([]);
      }
    } catch (err: any) {
      console.error('Error loading results:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het laden van de resultaten');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to format milliseconds to MM:SS.xx
  const formatMillisecondsToTime = (milliseconds: number): string => {
    if (!milliseconds || milliseconds <= 0) return '-';
    
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format as MM:SS.xx
    return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
  };

  const loadSkaterSeasonTimes = async (skater: Result, season: string) => {
    if (!skater.person_id) return;
    
    try {
      setLoadingSkaterTimes(true);
      
      const response = await SkatingAPI.getSeasonBest({
        person_id: [skater.person_id],
        season: [parseInt(season, 10)],
        distance: []
      });
      
      if (response && Array.isArray(response)) {
        setSkaterSeasonTimes(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Map the response data to use code instead of city for track display
        const mappedData = response.data.map(item => ({
          ...item,
          city: item.city || item.code || item.track || ''
        }));
        setSkaterSeasonTimes(mappedData);
      } else {
        setSkaterSeasonTimes([]);
      }
    } catch (err: any) {
      console.error('Error loading skater season times:', err);
      setSkaterSeasonTimes([]);
    } finally {
      setLoadingSkaterTimes(false);
    }
  };

  const handleTimeRowPress = (timeData: SeasonBestTime) => {
    setSelectedTimeRow(timeData);
    setToolbarVisible(true);
    
    // Show toolbar with animation
    toolbarOpacity.value = withTiming(1, { duration: 300 });
    toolbarTranslateY.value = withTiming(0, { duration: 300 });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideToolbar();
    }, 3000);
  };

  const hideToolbar = () => {
    toolbarOpacity.value = withTiming(0, { duration: 200 });
    toolbarTranslateY.value = withTiming(20, { duration: 200 });
    setTimeout(() => {
      setToolbarVisible(false);
      setSelectedTimeRow(null);
    }, 200);
  };

  const handleSkaterPress = (skater: Result) => {
    setSelectedSkater(skater);
    setSelectedSeason('2024'); // Reset to most recent season
    loadSkaterSeasonTimes(skater, '2024');
  };

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    if (selectedSkater) {
      loadSkaterSeasonTimes(selectedSkater, season);
    }
  };

  // Filter results based on current filters and search
  const filteredResults = useMemo(() => {
    let filteredData = [...results];

    // Debug logging
    console.log('=== FILTER DEBUG ===');
    console.log('Total results:', results.length);
    console.log('Current filters:', filters);
    console.log('Sample result data:', results[0]);
    console.log('Raw API sample:', results[0] ? {
      gender: results[0].geslachten,
      level: results[0].level,
      category: results[0].category,
      track: results[0].track
    } : 'No data');
    if (results.length > 0) {
      console.log('Gender values in data:', [...new Set(results.map(r => r.geslachten))]);
      console.log('Level values in data:', [...new Set(results.map(r => r.level))]);
      console.log('Category values in data:', [...new Set(results.map(r => r.category))]);
      console.log('Track values in data:', [...new Set(results.map(r => r.track))]);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredData = filteredData.filter(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply gender filter
    if (filters.geslachten !== 'all') {
      // Map filter values to API values: heren -> M, dames -> F
      const genderMap: Record<string, string> = {
        'heren': 'M',
        'dames': 'F'
      };
      
      const targetGender = genderMap[filters.geslachten] || filters.geslachten;
      console.log('Gender filter - looking for:', targetGender);
      console.log('Before gender filter:', filteredData.length);
      filteredData = filteredData.filter(result => result.geslachten === targetGender);
      console.log('After gender filter:', filteredData.length);
    }
    
    // Apply level filter
    if (filters.level !== 'all') {
      filteredData = filteredData.filter(result => result.level === filters.level);
    }
    
    // Apply category filter - map full names to 3-letter codes
    if (filters.category !== 'all') {
      // Map category filter values to API codes
      const categoryMap: Record<string, string> = {
        'HJA': 'HJA',
        'HJB': 'HJB', 
        'HJC': 'HJC',
        'HSA': 'HSA',
        'HSB': 'HSB',
        'HSC': 'HSC',
        'DJA': 'DJA',
        'DJB': 'DJB',
        'DJC': 'DJC',
        'DSA': 'DSA',
        'DSB': 'DSB',
        'DSC': 'DSC'
      };
      
      const targetCategory = categoryMap[filters.category] || filters.category;
      filteredData = filteredData.filter(result => result.category === targetCategory);
    }
    
    // Apply track filter
    if (filters.track !== 'all') {
      filteredData = filteredData.filter(result => result.track === filters.track);
    }

    return filteredData;
  }, [searchQuery, filters, results]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    return filteredResults.slice(startIndex, startIndex + resultsPerPage);
  }, [filteredResults, currentPage]);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const clearAllFilters = () => {
    setFilters({
      distance: '500',
      season: '2024',
      geslachten: 'all',
      level: 'all',
      category: 'all',
      track: 'all',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle modal animations
  const openModal = (modalKey: string) => {
    setActiveModal(modalKey);
    modalOpacity.value = withTiming(1, { duration: 200 });
    modalScale.value = withTiming(1, { duration: 200 });
  };

  const closeModal = () => {
    modalOpacity.value = withTiming(0, { duration: 150 });
    modalScale.value = withTiming(0.95, { duration: 150 });
    setTimeout(() => {
      setActiveModal(null);
    }, 150);
  };

  // Reset animation values when modal closes
  useEffect(() => {
    if (!activeModal) {
      modalOpacity.value = 0;
      modalScale.value = 0.95;
    }
  }, [activeModal]);

  // Animated styles
  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const animatedToolbarStyle = useAnimatedStyle(() => ({
    opacity: toolbarOpacity.value,
    transform: [{ translateY: toolbarTranslateY.value }],
  }));

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // If niveau is changed, reset category to 'all' if current category is not compatible
      if (key === 'level') {
        const filteredCategories = (skatingData?.filterOptions?.categories || []).filter(category => 
          value === 'all' || category.level === value || category.level === 'all'
        );
        
        const currentCategoryExists = filteredCategories.some(cat => cat.value === prev.category);
        if (!currentCategoryExists) {
          newFilters.category = 'all';
        }
      }
      
      return newFilters;
    });
    setCurrentPage(1);
    closeModal();
  };

  // Get filtered categories based on selected level
  const getFilteredCategories = () => {
    const allCategories = skatingData?.filterOptions?.categories || [];
    
    if (filters.level === 'all') {
      return allCategories;
    }
    
    return allCategories.filter(category => 
      category.level === filters.level || category.level === 'all'
    );
  };

  const renderFilterModal = (
    title: string,
    options: FilterOption[],
    currentValue: string,
    filterKey: string
  ) => (
    <Modal
      visible={activeModal === filterKey}
      transparent
      onRequestClose={closeModal}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeModal}
      >
        <Animated.View 
          style={[styles.modalContent, animatedModalStyle]}
        >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  currentValue === item.value && styles.modalOptionSelected,
                ]}
                onPress={() => updateFilter(filterKey, item.value)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    currentValue === item.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const renderResultItem = ({ item }: { item: Result }) => (
    <TouchableOpacity 
      style={styles.resultRow}
      activeOpacity={0.7}
      onPress={() => handleSkaterPress(item)}
    >
      <View style={styles.nameSection}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionBadgeText}>{item.position}</Text>
        </View>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
      <View style={styles.timeSection}>
        <Text style={styles.timeText}>
          {item.ansTime}
        </Text>
        {item.change !== 0 && (
          <View style={styles.changeContainer}>
            {item.change > 0 ? (
              <ArrowUp size={12} color="#22C55E" />
            ) : (
              <ArrowDown size={12} color="#EF4444" />
            )}
            <Text
              style={[
                styles.changeText,
                { color: item.change > 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              {Math.abs(item.change)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/knsb-logo.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ranglijsten Langebaan</Text>
        </View>

        {/* Data Selection Filters */}
        <View style={styles.filtersPanel}>
          <View style={styles.filtersRow}>
            {[
              { 
                key: 'distance', 
                title: 'Afstand', 
                options: [
                  { value: '500', label: '500m' },
                  { value: '1000', label: '1000m' },
                  { value: '1500', label: '1500m' },
                  { value: '3000', label: '3000m' },
                  { value: '5000', label: '5000m' },
                  { value: '10000', label: '10000m' }
                ]
              },
              { 
                key: 'season', 
                title: 'Seizoen', 
                options: [
                  { value: '2024', label: '2024' },
                  { value: '2023', label: '2023' }
                ]
              },
            ].map(({ key, title, options }) => (
              <TouchableOpacity
                key={key}
                style={styles.filterDropdownSmall}
                onPress={() => openModal(key)}
              >
                <View>
                  <Text style={styles.filterLabel}>{title}</Text>
                  <Text style={styles.filterValue}>
                    {options.find(opt => opt.value === filters[key as keyof typeof filters])?.label || 'Alle'}
                  </Text>
                </View>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#1E40AF" />
          <Text style={styles.filterToggleText}>Zoekfilters</Text>
          {showFilters ? (
            <ChevronUp size={20} color="#1E40AF" />
          ) : (
            <ChevronDown size={20} color="#1E40AF" />
          )}
        </TouchableOpacity>

        </TouchableOpacity>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.refineText}>Verfijn resultaten</Text>
              <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                <X size={16} color="#475569" />
                <Text style={styles.clearButtonText}>Wissen</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Zoek schaatser"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filter Dropdowns */}
            <View style={styles.filtersGrid}>
              {/* First row: Geslacht and Niveau */}
              <View style={styles.filtersRow}>
                {[
                  { key: 'geslachten', title: 'Geslacht', options: skatingData?.filterOptions?.geslachten || [] },
                  { key: 'level', title: 'Niveau', options: skatingData?.filterOptions?.levels || [] },
                ].map(({ key, title, options }) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.filterDropdownSmall}
                    onPress={() => openModal(key)}
                  >
                    <View>
                      <Text style={styles.filterLabel}>{title}</Text>
                      <Text style={styles.filterValue}>
                        {options.find(opt => opt.value === filters[key as keyof typeof filters])?.label || 'Alle'}
                      </Text>
                    </View>
                    <ChevronDown size={16} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Second row: Categorie (full width) */}
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => openModal('category')}
              >
                <View>
                  <Text style={styles.filterLabel}>Categorie</Text>
                  <Text style={styles.filterValue}>
                    {getFilteredCategories().find(opt => opt.value === filters.category)?.label || 'Alle'}
                  </Text>
                </View>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>Pos.</Text>
            <Text style={styles.headerText}>Naam</Text>
          </View>
          <Text style={[styles.headerText, styles.headerTextRight]}>ANS TIJD</Text>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Er is een fout opgetreden</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.errorButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.errorButtonText}>Opnieuw proberen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Resultaten laden...</Text>
          </View>
        )}

        {/* No Data State */}
        {!isLoading && !error && filteredResults.length === 0 && (
          <View style={styles.noDataContainer}>
            <View style={styles.noDataIconContainer}>
              <Database size={48} color="#94A3B8" />
            </View>
            <Text style={styles.noDataTitle}>Geen gegevens beschikbaar</Text>
            <Text style={styles.noDataMessage}>
              Er zijn geen gegevens beschikbaar voor de geselecteerde filters.
            </Text>
            <Text style={styles.noDataSubtext}>
              Probeer andere filteropties te selecteren.
            </Text>
          </View>
        )}

        {/* Results List */}
        {!isLoading && !error && filteredResults.length > 0 && (
          <FlatList
            data={paginatedResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderResultItem}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {/* Pagination */}
        {!isLoading && !error && filteredResults.length > 0 && totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>Vorige</Text>
            </TouchableOpacity>
            
            <Text style={styles.pageInfo}>
              Pagina {currentPage} van {totalPages}
            </Text>
            
            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>Volgende</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modals */}
      {renderFilterModal('Afstand', [
        { value: '500', label: '500m' },
        { value: '1000', label: '1000m' },
        { value: '1500', label: '1500m' },
        { value: '3000', label: '3000m' },
        { value: '5000', label: '5000m' },
        { value: '10000', label: '10000m' }
      ], filters.distance, 'distance')}
      {renderFilterModal('Seizoen', [
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' }
      ], filters.season, 'season')}
      {renderFilterModal('Geslacht', skatingData?.filterOptions?.geslachten || [], filters.geslachten, 'geslachten')}
      {renderFilterModal('Niveau', skatingData?.filterOptions?.levels || [], filters.level, 'level')}
      {renderFilterModal('Categorie', getFilteredCategories(), filters.category, 'category')}

      {/* Skater Detail Modal */}
      <Modal
        visible={selectedSkater !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSkater(null)}
      >
        <TouchableOpacity 
          style={styles.detailModalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedSkater(null)}
        >
          <TouchableOpacity 
            style={styles.detailModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedSkater && (
              <>
                <View style={styles.detailModalHeader}>
                  <View style={styles.detailPositionBadge}>
                    <Text style={styles.detailPositionText}>#{selectedSkater.position}</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    setSelectedSkater(null);
                    hideToolbar(); // Hide toolbar when modal closes
                  }}>
                    <X size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.detailNameText}>{selectedSkater.name}</Text>
                
                <Text style={styles.detailCategoryText}>
                  {(() => {
                    const categoryOption = (skatingData?.filterOptions?.categories || []).find(
                      opt => opt.value === selectedSkater.category
                    );
                    return categoryOption 
                      ? `${selectedSkater.category} - ${categoryOption.label}`
                      : selectedSkater.category;
                  })()}
                </Text>
                
                {/* Season Filter */}
                <View style={styles.seasonFilterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.seasonButton,
                      selectedSeason === '2024' && styles.seasonButtonActive
                    ]}
                    onPress={() => handleSeasonChange('2024')}
                  >
                    <Text style={[
                      styles.seasonButtonText,
                      selectedSeason === '2024' && styles.seasonButtonTextActive
                    ]}>2024</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.seasonButton,
                      selectedSeason === '2023' && styles.seasonButtonActive
                    ]}
                    onPress={() => handleSeasonChange('2023')}
                  >
                    <Text style={[
                      styles.seasonButtonText,
                      selectedSeason === '2023' && styles.seasonButtonTextActive
                    ]}>2023</Text>
                  </TouchableOpacity>
                </View>


                {/* Always render the times table container to maintain modal height */}
                <View style={styles.timesTableContainer}>
                  <View style={styles.timesTableTitleContainer}>
                    <Trophy size={20} color="#1E3A8A" />
                    <Text style={styles.timesTableTitle}>Beste tijden {selectedSeason}</Text>
                  </View>
                  
                  {loadingSkaterTimes ? (
                    <View style={styles.timesLoadingOverlay}>
                      <ActivityIndicator size="small" color="#1E3A8A" />
                      <Text style={styles.timesLoadingText}>Tijden laden...</Text>
                    </View>
                  ) : (
                    <View style={styles.timesTable}>
                      <View style={styles.timesTableHeader}>
                        <Text style={styles.timesTableHeaderText}>Afstand & Tijd</Text>
                        <Text style={styles.timesTableHeaderText}>Tijd</Text>
                      </View>
                      {skaterSeasonTimes.length > 0 ? (
                        skaterSeasonTimes.map((timeData, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.timesTableRow}
                            onPress={() => handleTimeRowPress(timeData)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.timesTableCellTimeContainer}>
                              <View style={styles.distanceBadge}>
                                <Text style={styles.distanceBadgeText}>{timeData.distance}m</Text>
                              </View>
                            </View>
                            <View style={styles.timesTableCellTrackContainer}>
                              <Text style={styles.timesTableCellValueText}>
                                {formatMillisecondsToTime(timeData.ans_time)}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.noTimesRow}>
                          <Text style={styles.noTimesText}>Geen tijden beschikbaar voor {selectedSeason}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* Track Toolbar - positioned inside modal below table */}
                  {toolbarVisible && selectedTimeRow && (
                    <View style={styles.toolbarContainer}>
                      <Animated.View style={[styles.trackToolbar, animatedToolbarStyle]}>
                        <Text style={styles.toolbarText}>
                          Baan: {selectedTimeRow.city || 'Onbekend'}
                        </Text>
                      </Animated.View>
                    </View>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
              </SafeAreaView>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerLogo: {
    height: 40,
    width: 120,
    tintColor: '#fff',
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 0,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    transition: 'all 0.2s ease',
  },
  'filterToggle:hover': {
    backgroundColor: '#F0F9FF',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterToggleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    transition: 'all 0.2s ease',
  },
  'clearButton:hover': {
    backgroundColor: '#E0F2FE',
    transform: 'translateY(-1px)',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  clearButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    borderWidth: 0,
    outlineStyle: 'none',
  },
  filtersGrid: {
    gap: 12,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refineText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterDropdownSmall: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    transition: 'all 0.2s ease',
  },
  'filterDropdownSmall:hover': {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
    transform: 'translateY(-1px)',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  'filterDropdownSmall:hover': {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
    transform: 'translateY(-1px)',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterDropdown: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    transition: 'all 0.2s ease',
  },
  'filterDropdown:hover': {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
    transform: 'translateY(-1px)',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  'filterDropdown:hover': {
    backgroundColor: '#E0F2FE',
    borderColor: '#0EA5E9',
    transform: 'translateY(-1px)',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 20,
  },
  headerTextRight: {
    textAlign: 'right',
    marginRight: 0,
  },
  resultsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },

  nameSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionBadge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 16,
    minWidth: 32,
    alignItems: 'center',
  },
  positionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  timeSection: {
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(0, 57, 166)',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    margin: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    backgroundColor: '#fff',
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  noDataIconContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailPositionBadge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailPositionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailCategoryText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  detailInfoGrid: {
    gap: 16,
  },
  detailInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  detailInfoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  detailChangeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  detailChangeLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  detailChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailChangeText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  seasonFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  seasonButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  seasonButtonActive: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  seasonButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  seasonButtonTextActive: {
    color: '#fff',
  },
  timesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  timesLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  timesLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  timesTableContainer: {
    marginTop: 8,
    position: 'relative',
    minHeight: 200,
  },
  timesTableTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timesTableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  timesTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timesTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timesTableHeaderText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  timesTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  timesTableCellTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesTableCellTrackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesTableCellValueText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    fontFamily: 'System',
  },
  distanceBadge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noTimesRow: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  noTimesText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  toolbarContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  trackToolbar: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  toolbarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  pageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pageButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  modalOption: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});