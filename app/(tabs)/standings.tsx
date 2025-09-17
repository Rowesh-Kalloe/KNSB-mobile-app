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
import {
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react-native';
import skatingData from '@/assets/data/skating_results_data.json';
import { SkatingAPI } from '@/services/api';

interface SeasonBestResult {
  name: string;
  distance500?: string;
  distance1000?: string;
  distance1500?: string;
  distance3000?: string;
  [key: string]: string | undefined;
}

export default function StandingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDataSelection, setShowDataSelection] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonBestData, setSeasonBestData] = useState<SeasonBestResult[]>([]);
  
  const [filters, setFilters] = useState({
    distance: '500-1000',
    season: '2024',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  // Initialize component
  useEffect(() => {
    loadSeasonBestPoints();
  }, []);

  const loadSeasonBestPoints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse distance filter into array of numbers
      const distanceNumbers = filters.distance.split('-').map(d => parseInt(d, 10));
      
      // Parse season filter into array of numbers
      const seasonNumbers = [parseInt(filters.season, 10)];
      
      const response = await SkatingAPI.getSeasonBestPoints({
        person_id: [],
        season: seasonNumbers,
        distance: distanceNumbers
      });
      
      if (response && Array.isArray(response)) {
        setSeasonBestData(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setSeasonBestData(response.data);
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

  const getDistanceColumns = () => {
    const distances = filters.distance.split('-');
    return distances.map(d => `distance${d}`);
  };

  const renderSeasonBestItem = ({ item }: { item: SeasonBestResult }) => {
    const distanceColumns = getDistanceColumns();
    
    return (
      <View style={styles.resultRow}>
        <View style={styles.nameSection}>
          <Text style={styles.nameText}>{item.name}</Text>
        </View>
        <View style={styles.timesSection}>
          {distanceColumns.map((distanceKey, index) => (
            <View key={distanceKey} style={styles.timeColumn}>
              <Text style={styles.timeText}>
                {item[distanceKey] || '-'}
              </Text>
            </View>
          ))}
        </View>
      </View>
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

          {/* Data Selection Toggle */}
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowDataSelection(!showDataSelection)}
          >
            <Filter size={20} color="#1E40AF" />
            <Text style={styles.filterToggleText}>Gegevens selectie</Text>
            {showDataSelection ? (
              <ChevronUp size={20} color="#1E40AF" />
            ) : (
              <ChevronDown size={20} color="#1E40AF" />
            )}
          </TouchableOpacity>

          {/* Data Selection Panel */}
          {showDataSelection && (
            <View style={styles.filtersPanel}>
              {/* Data Selection Dropdowns */}
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
                    onPress={() => setActiveModal(filter.key)}
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
          )}

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
              {filters.distance.split('-').map((distance) => (
                <Text key={distance} style={[styles.headerText, styles.headerTextRight]}>
                  {distance}m
                </Text>
              ))}
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
              data={seasonBestData}
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
      </SafeAreaView>
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
    color: 'rgb(0, 57, 166)',
  },
  nameSection: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
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
});