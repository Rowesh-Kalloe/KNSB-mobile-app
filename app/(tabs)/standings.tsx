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

export default function StandingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDataSelection, setShowDataSelection] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    distance: '500',
    season: '2025-2026',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setError(null);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const clearAllFilters = () => {
    setFilters({
      distance: '500',
      season: '2025-2026',
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
                  { key: 'distance', title: 'Afstand', options: skatingData?.filterOptions?.distances || [] },
                  { key: 'season', title: 'Seizoen', options: skatingData?.filterOptions?.seasons || [] },
                ].map(({ key, title, options }) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.filterDropdownSmall}
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
                
                {/* Second row: Categorie and Baan */}
                <View style={styles.filtersRow}>
                  {[
                    { key: 'category', title: 'Categorie', options: skatingData?.filterOptions?.categories || [] },
                    { key: 'track', title: 'Baan', options: skatingData?.filterOptions?.tracks || [] },
                  ].map(({ key, title, options }) => (
                    <TouchableOpacity
                      key={key}
                      style={styles.filterDropdownSmall}
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
            </View>
          )}

          {/* Content Area - Placeholder for now */}
          <View style={styles.contentArea}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Seizoen beste punten laden...</Text>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderTitle}>Seizoen Beste Punten</Text>
                <Text style={styles.placeholderText}>
                  Hier komen de seizoen beste punten van alle schaatsers te staan.
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Data wordt binnenkort toegevoegd via de API.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Filter Modals */}
        {renderFilterModal('Afstand', skatingData?.filterOptions?.distances || [], filters.distance, 'distance')}
        {renderFilterModal('Seizoen', skatingData?.filterOptions?.seasons || [], filters.season, 'season')}
        {renderFilterModal('Geslacht', skatingData?.filterOptions?.geslachten || [], filters.geslachten, 'geslachten')}
        {renderFilterModal('Niveau', skatingData?.filterOptions?.levels || [], filters.level, 'level')}
        {renderFilterModal('Categorie', skatingData?.filterOptions?.categories || [], filters.category, 'category')}
        {renderFilterModal('Baan', skatingData?.filterOptions?.tracks || [], filters.track, 'track')}
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
    color: '#1E293B',
    fontWeight: '600',
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