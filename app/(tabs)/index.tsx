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
} from 'react-native';
import {
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react-native';
import skatingData from '@/assets/data/skating_results_data.json';
// import { SkatingAPI } from '@/services/api';

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

  const [selectedSkater, setSelectedSkater] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    distance: 'all',
    season: 'all',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  const resultsPerPage = 20;

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setError(null);
    }, 500); // Small delay for better UX
    
    return () => clearTimeout(timer);
  }, []);

  // Filter results based on current filters and search
  const filteredResults = useMemo(() => {
    // Use local data since API is temporarily disabled
    const localData = skatingData?.mockResults && Array.isArray(skatingData.mockResults) ? skatingData.mockResults : [];
    
    let results = [...localData];

    // Apply search filter
    if (searchQuery.trim()) {
      results = results.filter(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply dropdown filters
    if (filters.distance !== 'all') {
      results = results.filter(result => result.distance.toString() === filters.distance);
    }
    if (filters.geslachten !== 'all') {
      results = results.filter(result => result.geslachten === filters.geslachten);
    }
    if (filters.level !== 'all') {
      results = results.filter(result => result.level === filters.level);
    }
    if (filters.category !== 'all') {
      results = results.filter(result => result.category === filters.category);
    }
    if (filters.track !== 'all') {
      results = results.filter(result => result.track === filters.track);
    }

    return results;
  }, [searchQuery, filters]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    return filteredResults.slice(startIndex, startIndex + resultsPerPage);
  }, [filteredResults, currentPage]);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  const clearAllFilters = () => {
    setFilters({
      distance: 'all',
      season: 'all',
      geslachten: 'all',
      level: 'all',
      category: 'all',
      track: 'all',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setActiveModal(null);
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
      animationType="fade"
      onRequestClose={() => setActiveModal(null)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setActiveModal(null)}
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
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
      </TouchableOpacity>
    </Modal>
  );

  const renderResultItem = ({ item }: { item: Result }) => (
    <TouchableOpacity 
      style={styles.resultRow}
      activeOpacity={0.7}
      onPress={() => setSelectedSkater(item)}
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
        <Text style={styles.headerTitle}>KNSB</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ranglijsten Langebaan</Text>
          <Text style={styles.noticeText}>Let op: het kan even duren voordat de nieuwste tijden zichtbaar zijn.</Text>
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#1E40AF" />
          <Text style={styles.filterToggleText}>Filters</Text>
          {showFilters ? (
            <ChevronUp size={20} color="#1E40AF" />
          ) : (
            <ChevronDown size={20} color="#1E40AF" />
          )}
        </TouchableOpacity>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Text style={styles.clearButtonText}>Wis alle filters</Text>
            </TouchableOpacity>

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
              {[
                { key: 'distance', title: 'Afstand', options: skatingData?.filterOptions?.distances || [] },
                { key: 'season', title: 'Seizoen', options: skatingData?.filterOptions?.seasons || [] },
                { key: 'geslachten', title: 'Geslacht', options: skatingData?.filterOptions?.geslachten || [] },
                { key: 'level', title: 'Niveau', options: skatingData?.filterOptions?.levels || [] },
                { key: 'category', title: 'Categorie', options: skatingData?.filterOptions?.categories || [] },
                { key: 'track', title: 'Baan', options: skatingData?.filterOptions?.tracks || [] },
              ].map(({ key, title, options }) => (
                <TouchableOpacity
                  key={key}
                  style={styles.filterDropdown}
                  onPress={() => setActiveModal(key)}
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
        )}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerText}>Pos.</Text>
            <Text style={styles.headerText}>Naam</Text>
          </View>
          <Text style={styles.headerText}>ANS tijd</Text>
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

        {/* Results List */}
        {!isLoading && (
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
        {!isLoading && totalPages > 1 && (
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
      {renderFilterModal('Afstand', skatingData?.filterOptions?.distances || [], filters.distance, 'distance')}
      {renderFilterModal('Seizoen', skatingData?.filterOptions?.seasons || [], filters.season, 'season')}
      {renderFilterModal('Geslacht', skatingData?.filterOptions?.geslachten || [], filters.geslachten, 'geslachten')}
      {renderFilterModal('Niveau', skatingData?.filterOptions?.levels || [], filters.level, 'level')}
      {renderFilterModal('Categorie', skatingData?.filterOptions?.categories || [], filters.category, 'category')}
      {renderFilterModal('Baan', skatingData?.filterOptions?.tracks || [], filters.track, 'track')}

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
                
                <View style={styles.detailInfoGrid}>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>ANS Tijd</Text>
                    <Text style={styles.detailInfoValue}>{selectedSkater.ansTime}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Afstand</Text>
                    <Text style={styles.detailInfoValue}>{selectedSkater.distance}m</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Categorie</Text>
                    <Text style={styles.detailInfoValue}>{selectedSkater.category}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Datum</Text>
                    <Text style={styles.detailInfoValue}>{selectedSkater.date}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <Text style={styles.detailInfoLabel}>Baan</Text>
                    <Text style={styles.detailInfoValue}>{selectedSkater.track}</Text>
                  </View>
                </View>
                
                {selectedSkater.change !== 0 && (
                  <View style={styles.detailChangeSection}>
                    <Text style={styles.detailChangeLabel}>Positie verandering</Text>
                    <View style={styles.detailChangeContainer}>
                      {selectedSkater.change > 0 ? (
                        <ArrowUp size={16} color="#22C55E" />
                      ) : (
                        <ArrowDown size={16} color="#EF4444" />
                      )}
                      <Text
                        style={[
                          styles.detailChangeText,
                          { color: selectedSkater.change > 0 ? '#22C55E' : '#EF4444' },
                        ]}
                      >
                        {Math.abs(selectedSkater.change)} posities
                      </Text>
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
    paddingVertical: 16,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
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
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  clearButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
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
  },
  filtersGrid: {
    gap: 12,
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