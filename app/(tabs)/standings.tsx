import React, { useState, useEffect } from 'react';
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
  withTiming 
} from 'react-native-reanimated';
import {
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Ban,
  Trophy,
} from 'lucide-react-native';
import skatingData from '@/assets/data/skating_results_data.json';
import { SkatingAPI } from '@/services/api';

interface SeasonBestResult {
  name: string;
  person_id: number;
  ans_total_points: number;
  position?: number;
}

interface SkaterDetailResult {
  name: string;
  person_id: number;
  ans_time_500?: number;
  ans_time_1000?: number;
  ans_time_1500?: number;
  ans_time_3000?: number;
  ans_time_5000?: number;
  ans_time_10000?: number;
}

export default function StandingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDataSelection, setShowDataSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasonBestData, setSeasonBestData] = useState<SeasonBestResult[]>([]);
  const [selectedSkater, setSelectedSkater] = useState<SeasonBestResult | null>(null);
  const [skaterDetails, setSkaterDetails] = useState<SkaterDetailResult | null>(null);
  const [loadingSkaterDetails, setLoadingSkaterDetails] = useState(false);
  
  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.95);
  
  // Animated styles
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });
  
  // Modal functions
  const openModal = (modalKey: string) => {
    setActiveModal(modalKey);
    modalOpacity.value = withTiming(1, { duration: 200 });
    modalScale.value = withTiming(1, { duration: 200 });
  };
  
  const closeModal = () => {
    modalOpacity.value = withTiming(0, { duration: 150 });
    modalScale.value = withTiming(0.95, { duration: 150 });
    setTimeout(() => setActiveModal(null), 150);
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

  const [filters, setFilters] = useState({
    distance: '500-1000',
    season: '2024',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  // Filter the API data based on search query
  const filteredSeasonBestData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return seasonBestData;
    }
    
    return seasonBestData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [seasonBestData, searchQuery]);
  // Initialize component
  useEffect(() => {
    loadSeasonBestPoints();
  }, [filters.distance, filters.season]); // Re-fetch when data selection filters change

  const loadSeasonBestPoints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse distance filter into array of numbers
      let distanceNumbers: number[] = [];
      if (filters.distance === '500-1000') {
        distanceNumbers = [500, 1000];
      } else if (filters.distance === '500-1000-1500') {
        distanceNumbers = [500, 1000, 1500];
      } else if (filters.distance === '500-1500-3000') {
        distanceNumbers = [500, 1500, 3000];
      } else if (filters.distance === '500-1000-1500-3000') {
        distanceNumbers = [500, 1000, 1500, 3000];
      }
      
      // Parse season filter into array of numbers
      const seasonNumbers = [parseInt(filters.season, 10)];
      
      const response = await SkatingAPI.getSeasonBestPoints({
        person_id: [],
        season: seasonNumbers,
        distance: distanceNumbers
      });
      
      if (response && Array.isArray(response)) {
        // Process data without sorting - API handles ordering
        const processedData = response
          .filter(item => item.ans_total_points != null)
          .map((item, index) => ({
            ...item,
            person_id: item.person_id || 0, // Ensure person_id is included
            position: item.position || index + 1 // Use API position or fallback to index
          }));
        setSeasonBestData(processedData);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Process data without sorting - API handles ordering
        const processedData = response.data
          .filter(item => item.ans_total_points != null)
          .map((item, index) => ({
            ...item,
            person_id: item.person_id || 0, // Ensure person_id is included
            position: item.position || index + 1 // Use API position or fallback to index
          }));
        setSeasonBestData(processedData);
      } else {
        console.warn('Unexpected API response format:', response);
        setSeasonBestData([]);
      }
    } catch (err: any) {
      console.error('Error loading season best points:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het laden van de gegevens');
      setSeasonBestData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkaterDetails = async (skater: SeasonBestResult) => {
    try {
      setLoadingSkaterDetails(true);
      
      // Parse distance filter into array of numbers for the detail request
      let distanceNumbers: number[] = [];
      if (filters.distance === '500-1000') {
        distanceNumbers = [500, 1000];
      } else if (filters.distance === '500-1000-1500') {
        distanceNumbers = [500, 1000, 1500];
      } else if (filters.distance === '500-1500-3000') {
        distanceNumbers = [500, 1500, 3000];
      } else if (filters.distance === '500-1000-1500-3000') {
        distanceNumbers = [500, 1000, 1500, 3000];
      }
      
      const seasonNumbers = [parseInt(filters.season, 10)];
      
      const response = await SkatingAPI.getSeasonBestPoints({
        person_id: [skater.person_id],
        season: seasonNumbers,
        distance: distanceNumbers
      });
      
      if (response && Array.isArray(response) && response.length > 0) {
        setSkaterDetails(response[0]);
      } else if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSkaterDetails(response.data[0]);
      } else {
        setSkaterDetails(null);
      }
    } catch (err: any) {
      console.error('Error loading skater details:', err);
      setSkaterDetails(null);
    } finally {
      setLoadingSkaterDetails(false);
    }
  };

  const handleSkaterPress = (skater: SeasonBestResult) => {
    setSelectedSkater(skater);
    loadSkaterDetails(skater);
  };

  const clearAllFilters = () => {
    setFilters({
      distance: '500-1000',
      season: '2024',
      geslachten: 'all',
      level: 'all',
      category: 'all',
      track: 'all',
    });
    setSearchQuery('');
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveModal(null);
  };

  const renderSeasonBestItem = ({ item }: { item: SeasonBestResult }) => {
    return (
      <TouchableOpacity 
        style={styles.resultRow}
        activeOpacity={0.7}
        onPress={() => handleSkaterPress(item)}
      >
        <View style={styles.nameSection}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionBadgeText}>{item.position || '-'}</Text>
          </View>
          <Text style={styles.nameText}>{item.name}</Text>
        </View>
        <View style={styles.pointsSection}>
          <Text style={styles.pointsText}>
            {Math.round(item.ans_total_points) || '-'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = (
    title: string,
    options: any[],
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
            contentContainerStyle={styles.modalOptionsList}
          />
        </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
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
            <Text style={styles.sectionTitle}>Seizoen Beste Punten</Text>
          </View>

          {/* Data Selection Filters */}
          <View style={styles.filtersPanel}>
            <View style={styles.filtersRow}>
              {[
                {
                  key: 'distance',
                  title: 'Klassement',
                  options: [
                    { value: '500-1000', label: '500-1000' },
                    { value: '500-1000-1500', label: '500-1000-1500' },
                    { value: '500-1500-3000', label: '500-1500-3000' },
                    { value: '500-1000-1500-3000', label: '500-1000-1500-3000' }
                  ]
                },
                {
                  key: 'season',
                  title: 'Seizoen',
                  options: [
                    { value: '2023', label: '2023' },
                    { value: '2024', label: '2024' }
                  ]
                }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={styles.filterDropdownSmall}
                  onPress={() => openModal(filter.key)}
                >
                  <View>
                    <Text style={styles.filterLabel}>{filter.title}</Text>
                    <Text style={styles.filterValue}>
                      {(() => {
                        const displayValue = filter.options.find(opt => opt.value === filters[filter.key as keyof typeof filters])?.label || filters[filter.key as keyof typeof filters];
                        return displayValue;
                      })()}
                    </Text>
                  </View>
                  <ChevronDown size={16} color="#64748B" />
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

          {/* Filters Panel */}
          {showFilters && (
            <View style={styles.filtersPanel}>
              <View style={styles.filterHeaderRow}>
                <Text style={styles.refineText}>Verfijn zoekresultaten</Text>
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

            </View>
          )}

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerText}>Naam</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerText}>Punten</Text>
            </View>
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Er is een fout opgetreden</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity 
                style={styles.errorButton}
                onPress={loadSeasonBestPoints}
              >
                <Text style={styles.errorButtonText}>Opnieuw proberen</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Seizoen beste punten laden...</Text>
            </View>
          )}

          {/* Results List */}
          {!isLoading && !error && (
            <FlatList
              data={filteredSeasonBestData}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={renderSeasonBestItem}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </ScrollView>

        {/* Filter Modals */}
        {renderFilterModal('Klassement', [
          { value: '500-1000', label: '500-1000' },
          { value: '500-1000-1500', label: '500-1000-1500' },
          { value: '500-1500-3000', label: '500-1500-3000' },
          { value: '500-1000-1500-3000', label: '500-1000-1500-3000' }
        ], filters.distance, 'distance')}
        {renderFilterModal('Seizoen', [
          { value: '2023', label: '2023' },
          { value: '2024', label: '2024' }
        ], filters.season, 'season')}

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
                    <TouchableOpacity onPress={() => setSelectedSkater(null)}>
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.detailNameText}>{selectedSkater.name}</Text>
                  
                  {/* Individual Times Table */}
                  {loadingSkaterDetails ? (
                    <View style={styles.timesLoadingContainer}>
                      <ActivityIndicator size="small" color="#1E3A8A" />
                      <Text style={styles.timesLoadingText}>Tijden laden...</Text>
                    </View>
                  ) : (
                    <View style={styles.timesTableContainer}>
                      <View style={styles.timesTableTitleContainer}>
                        <Trophy size={20} color="#1E3A8A" />
                        <Text style={styles.timesTableTitle}>Beste tijden in {filters.season}</Text>
                      </View>
                      <View style={styles.timesTable}>
                        <View style={styles.timesTableHeader}>
                          <Text style={styles.timesTableHeaderText}>Afstand</Text>
                          <Text style={styles.timesTableHeaderText}>Tijd</Text>
                        </View>
                        {(() => {
                          const distances = [];
                          if (filters.distance.includes('500')) distances.push({ key: 'ans_time_500', label: '500m' });
                          if (filters.distance.includes('1000')) distances.push({ key: 'ans_time_1000', label: '1000m' });
                          if (filters.distance.includes('1500')) distances.push({ key: 'ans_time_1500', label: '1500m' });
                          if (filters.distance.includes('3000')) distances.push({ key: 'ans_time_3000', label: '3000m' });
                          if (filters.distance.includes('5000')) distances.push({ key: 'ans_time_5000', label: '5000m' });
                          if (filters.distance.includes('10000')) distances.push({ key: 'ans_time_10000', label: '10000m' });
                          
                          return distances.map((distance) => (
                            <View key={distance.key} style={styles.timesTableRow}>
                              <Text style={styles.timesTableCellLabel}>{distance.label}</Text>
                              <View style={styles.timesTableCellValue}>
                                {skaterDetails?.[distance.key as keyof SkaterDetailResult] ? (
                                  <Text style={styles.timesTableCellValueText}>
                                    {formatMillisecondsToTime(skaterDetails[distance.key as keyof SkaterDetailResult] as number)}
                                  </Text>
                                ) : (
                                  <Ban size={16} color="#94A3B8" />
                                )}
                              </View>
                            </View>
                          ));
                        })()}
                      </View>
                    </View>
                  )}
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
    marginRight: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  positionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0039A6',
  },
  pointsSection: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: 300,
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
  placeholderContainer: {
    backgroundColor: '#fff',
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
    marginRight: 0,
    minWidth: 60,
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
  timesSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    minWidth: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
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
    marginBottom: 24,
    textAlign: 'center',
  },
  detailInfoGrid: {
    gap: 16,
    marginBottom: 24,
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
  timesTableContainer: {
    marginTop: 16,
  },
  timesTableTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timesTableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
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
  },
  timesTableCellLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  timesTableCellValue: {
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
  modalOptionsList: {
    paddingBottom: 20,
  },
});