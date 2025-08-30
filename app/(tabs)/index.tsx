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
  Image,
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
  const [showANSTime, setShowANSTime] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  const [filters, setFilters] = useState({
    distance: 'all',
    season: 'all',
    geslachten: 'all',
    level: 'all',
    category: 'all',
    track: 'all',
  });

  const resultsPerPage = 20;

  // Filter results based on current filters and search
  const filteredResults = useMemo(() => {
    let results = [...skatingData.mockResults];

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
      style={[
        styles.resultRow,
        hoveredItem === item.id && styles.resultRowHovered
      ]}
      onPressIn={() => setHoveredItem(item.id)}
      onPressOut={() => setHoveredItem(null)}
      activeOpacity={1}
    >
      <View style={styles.resultCell}>
        <Text style={styles.positionText}>{item.position}</Text>
      </View>
      <View style={[styles.resultCell, styles.nameCell]}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <View style={styles.resultCell}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.trackText}>{item.track}</Text>
      </View>
      <View style={styles.resultCell}>
        <Text style={styles.timeText}>
          {showANSTime ? item.ansTime : item.time}
        </Text>
        {showANSTime && item.change !== 0 && (
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
          source={require('@/assets/images/KNSB-logo.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
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
                { key: 'distance', title: 'Afstand', options: skatingData.filterOptions.distances },
                { key: 'season', title: 'Seizoen', options: skatingData.filterOptions.seasons },
                { key: 'geslachten', title: 'Geslacht', options: skatingData.filterOptions.geslachten },
                { key: 'level', title: 'Niveau', options: skatingData.filterOptions.levels },
                { key: 'category', title: 'Categorie', options: skatingData.filterOptions.categories },
                { key: 'track', title: 'Baan', options: skatingData.filterOptions.tracks },
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

        {/* Time Toggle */}
        <View style={styles.timeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, !showANSTime && styles.toggleButtonActive]}
            onPress={() => setShowANSTime(false)}
          >
            <Text style={[styles.toggleText, !showANSTime && styles.toggleTextActive]}>
              Normale tijd
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showANSTime && styles.toggleButtonActive]}
            onPress={() => setShowANSTime(true)}
          >
            <Text style={[styles.toggleText, showANSTime && styles.toggleTextActive]}>
              ANS tijd
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Pos.</Text>
          </View>
          <View style={[styles.headerCell, styles.nameHeaderCell]}>
            <Text style={styles.headerText}>Naam</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Datum</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Tijd</Text>
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={paginatedResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResultItem}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />

        {/* Pagination */}
        {totalPages > 1 && (
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
      {renderFilterModal('Afstand', skatingData.filterOptions.distances, filters.distance, 'distance')}
      {renderFilterModal('Seizoen', skatingData.filterOptions.seasons, filters.season, 'season')}
      {renderFilterModal('Geslacht', skatingData.filterOptions.geslachten, filters.geslachten, 'geslachten')}
      {renderFilterModal('Niveau', skatingData.filterOptions.levels, filters.level, 'level')}
      {renderFilterModal('Categorie', skatingData.filterOptions.categories, filters.category, 'category')}
      {renderFilterModal('Baan', skatingData.filterOptions.tracks, filters.track, 'track')}
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
  headerLogo: {
    height: 50,
    width: 200,
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
    outlineStyle: 'none',
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
  timeToggle: {
    flexDirection: 'row',
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
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  toggleTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
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
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  nameHeaderCell: {
    flex: 2,
    alignItems: 'flex-start',
  },
  headerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  resultRowHovered: {
    backgroundColor: '#F8FAFC',
  },
  resultCell: {
    flex: 1,
    alignItems: 'center',
  },
  nameCell: {
    flex: 2,
    alignItems: 'flex-start',
  },
  positionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  trackText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'monospace',
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