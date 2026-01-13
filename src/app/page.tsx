'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Search, Filter, TrendingUp, FileText, Layers, Award, Building2, ChevronRight, ChevronLeft, BookOpen, Radar as RadarIcon, Info } from 'lucide-react';

interface Proposal {
  id: number;
  partido: string;
  dimension: string;
  categoria: string;
  cita: string;
  madurez: string;
}

interface PartyStats {
  total_proposals: number;
  dimension_counts: Record<string, number>;
  category_counts: Record<string, number>;
  madurez_counts: Record<string, number>;
  avg_madurez: number;
  tech_counts: Record<string, number>;
}

interface Data {
  metadata: {
    total_proposals: number;
    total_parties: number;
    total_dimensions: number;
    total_categories: number;
    madurez_types: string[];
  };
  parties: string[];
  dimensions: string[];
  categories: string[];
  madurez_types: string[];
  proposals: Proposal[];
  statistics: {
    by_party: Record<string, PartyStats>;
    by_dimension: Record<string, any>;
    by_category: Record<string, any>;
  };
}

// Colores para partidos
const PARTY_COLORS = {
  'Ahora Nación': '#E63946',
  'Alianza Fuerza y Libertad': '#457B9D',
  'Alianza Venceremos': '#F4A261',
  'Alianza para el Progreso': '#2A9D8F',
  'Avanza País Partido de Integración Social': '#E76F51',
  'Fe en el Perú': '#4ECDC4',
  'Fuerza Popular': '#E74C3C',
  'Integridad Democrática': '#9B59B6',
  'Partido Aprista Peruano': '#FF6B6B',
  'Partido del Buen Gobierno': '#3498DB'
};

// Colores de secciones - Sistema armonioso
const SECTION_COLORS = {
  overview: {
    primary: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50/50 to-indigo-50/50',
    border: 'border-blue-200 dark:border-blue-800',
    accent: '#3b82f6',
    icon: 'text-blue-600',
    gradient: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500'
  },
  radar: {
    primary: 'from-purple-500 to-pink-600',
    bg: 'from-purple-50/50 to-pink-50/50',
    border: 'border-purple-200 dark:border-purple-800',
    accent: '#8b5cf6',
    icon: 'text-purple-600',
    gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500'
  },
  comparison: {
    primary: 'from-rose-500 to-orange-500',
    bg: 'from-rose-50/50 to-orange-50/50',
    border: 'border-rose-200 dark:border-rose-800',
    accent: '#f43f5e',
    icon: 'text-rose-600',
    gradient: 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500'
  },
  technology: {
    primary: 'from-emerald-500 to-teal-600',
    bg: 'from-emerald-50/50 to-teal-50/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: '#10b981',
    icon: 'text-emerald-600',
    gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
  },
  proposals: {
    primary: 'from-amber-500 to-orange-600',
    bg: 'from-amber-50/50 to-orange-50/50',
    border: 'border-amber-200 dark:border-amber-800',
    accent: '#f59e0b',
    icon: 'text-amber-600',
    gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
  }
};

// Etiquetas de madurez con mejor tipografía
const MADUREZ_LABELS = {
  'Normativa/Estructurada': 'Normativa/Estructurada',
  'Programática': 'Programática',
  'Instrumental': 'Instrumental',
  'Declarativa': 'Declarativa'
};

// Iconos por sección
const SECTION_ICONS = {
  overview: TrendingUp,
  radar: Award,
  comparison: Layers,
  technology: BookOpen,
  proposals: FileText
};

// Colores para madurez
const MADUREZ_COLORS = {
  'Normativa/Estructurada': '#166534',
  'Programática': '#2563eb',
  'Instrumental': '#d97706',
  'Declarativa': '#64748b'
};


export default function RadarDigitalPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMadurez, setSelectedMadurez] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/proposals');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filteredProposals = data?.proposals.filter(proposal => {
    const matchesSearch = searchTerm === '' ||
      proposal.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.partido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.dimension.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParty = selectedParty === 'all' || proposal.partido === selectedParty;
    const matchesDimension = selectedDimension === 'all' || proposal.dimension === selectedDimension;
    const matchesCategory = selectedCategory === 'all' || proposal.categoria === selectedCategory;
    const matchesMadurez = selectedMadurez === 'all' || proposal.madurez === selectedMadurez;

    return matchesSearch && matchesParty && matchesDimension && matchesCategory && matchesMadurez;
  }) || [];

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProposals = filteredProposals.slice(startIndex, endIndex);

  // Prepare radar chart data for selected party
  const getRadarDataForParty = (partyName: string) => {
    if (!data) return [];
    const partyStats = data.statistics.by_party[partyName];
    if (!partyStats) return [];

    const maxCount = Math.max(...Object.values(partyStats.dimension_counts), 1);

    return Object.entries(partyStats.dimension_counts).map(([dimension, count]) => ({
      dimension: dimension.length > 15 ? dimension.substring(0, 15) + '...' : dimension,
      value: Math.round((count / maxCount) * 100),
      count: count,
      fullDimension: dimension
    }));
  };

  // Prepare comparison bar chart data
  const getComparisonData = () => {
    if (!data) return [];

    const maxProposals = Math.max(
      ...Object.values(data.statistics.by_party).map(p => p.total_proposals),
      1
    );

    return data.parties.map(party => ({
      party: party.length > 12 ? party.substring(0, 12) + '...' : party,
      fullParty: party,
      proposals: data.statistics.by_party[party]?.total_proposals || 0,
      avgMadurez: data.statistics.by_party[party]?.avg_madurez || 0
    })).sort((a, b) => b.proposals - a.proposals);
  };

  // Prepare madurez distribution data
  const getMadurezDistributionData = () => {
    if (!data) return [];

    return data.madurez_types.map(madurez => {
      const count = filteredProposals.filter(p => p.madurez === madurez).length;
      return {
        name: madurez.split('/')[0],
        value: count,
        fullName: madurez
      };
    }).filter(item => item.value > 0);
  };

  // Prepare tech mentions data
  const getTechMentionsData = () => {
    if (!data) return [];

    const allTechCounts: Record<string, number> = {};
    data.parties.forEach(party => {
      const techCounts = data.statistics.by_party[party]?.tech_counts || {};
      Object.entries(techCounts).forEach(([tech, count]) => {
        allTechCounts[tech] = (allTechCounts[tech] || 0) + count;
      });
    });

    return Object.entries(allTechCounts)
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Prepare dimension distribution data for selected party
  const getDimensionPieData = (partyName: string) => {
    if (!data) return [];
    const partyStats = data.statistics.by_party[partyName];
    if (!partyStats) return [];

    return Object.entries(partyStats.dimension_counts)
      .map(([dimension, count]) => ({
        name: dimension.length > 12 ? dimension.substring(0, 12) + '...' : dimension,
        value: count,
        fullName: dimension
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Prepare category distribution data for selected party
  const getCategoryData = (partyName: string) => {
    if (!data) return [];
    const partyStats = data.statistics.by_party[partyName];
    if (!partyStats) return [];

    return Object.entries(partyStats.category_counts)
      .map(([category, count]) => ({
        name: category.length > 15 ? category.substring(0, 15) + '...' : category,
        value: count,
        fullName: category
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const getMadurezColor = (madurez: string) => {
    if (madurez.includes('Normativa')) return MADUREZ_COLORS['Normativa/Estructurada'];
    if (madurez.includes('Programática')) return MADUREZ_COLORS['Programática'];
    if (madurez.includes('Instrumental')) return MADUREZ_COLORS['Instrumental'];
    return MADUREZ_COLORS['Declarativa'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Cargando Radar Digital...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Error al cargar los datos</p>
          <Button onClick={fetchData} className="mt-4">Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <RadarIcon className="w-8 h-8 md:w-10 md:h-10" />
                Radar Digital
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Plan de Gobierno Perú 2026 - Análisis de las propuestas tecnológicas
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Badge variant="outline" className="text-sm">
                <FileText className="w-4 h-4 mr-1" />
                {data.metadata.total_proposals} Propuestas
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Building2 className="w-4 h-4 mr-1" />
                {data.metadata.total_parties} Partidos
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Layers className="w-4 h-4 mr-1" />
                {data.metadata.total_dimensions} Dimensiones
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Party Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[132px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2 min-w-max">
              <Button
                variant={selectedParty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedParty('all')}
                className="shrink-0"
              >
                <Building2 className="w-4 h-4 mr-1" />
                Todos
              </Button>
              {data?.parties.map(party => (
                <Button
                  key={party}
                  variant={selectedParty === party ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedParty(party)}
                  className="shrink-0"
                  style={{
                    ...(selectedParty === party ? {
                      backgroundColor: PARTY_COLORS[party as keyof typeof PARTY_COLORS],
                      color: 'white'
                    } : {})
                  }}
                >
                  {party.length > 20 ? party.substring(0, 20) + '...' : party}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Propuestas</CardDescription>
              <CardTitle className="text-3xl">{data.metadata.total_proposals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>890 propuestas analizadas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Partidos Políticos</CardDescription>
              <CardTitle className="text-3xl">{data.metadata.total_parties}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Con planes de gobierno
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Dimensiones</CardDescription>
              <CardTitle className="text-3xl">{data.metadata.total_dimensions}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Áreas de análisis
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Categorías</CardDescription>
              <CardTitle className="text-3xl">{data.metadata.total_categories}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tecnológicas clasificadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar en propuestas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los partidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los partidos</SelectItem>
                  {data.parties.map(party => (
                    <SelectItem key={party} value={party}>{party}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las dimensiones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dimensiones</SelectItem>
                  {data.dimensions.map(dim => (
                    <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMadurez} onValueChange={setSelectedMadurez}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las madurez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las madurez</SelectItem>
                  {data.madurez_types.map(madurez => (
                    <SelectItem key={madurez} value={madurez}>{madurez}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 lg:grid-cols-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Visión General</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Radar</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:border-rose-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Comparativa</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="technology"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Tecnologías</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="proposals"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border-amber-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Propuestas</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Propuestas por Partido */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Propuestas por Partido</CardTitle>
                  <CardDescription>Número total de propuestas por cada partido político</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="party"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={11}
                      />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                                <p className="font-semibold">{payload[0].payload.fullParty}</p>
                                <p className="text-sm">Propuestas: {payload[0].value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="proposals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribución por Madurez */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Distribución por Nivel de Madurez</CardTitle>
                  <CardDescription>Clasificación de propuestas por su nivel de detalle</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getMadurezDistributionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getMadurezDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getMadurezColor(entry.fullName)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Dimensiones */}
              <Card className="hover:shadow-lg transition-shadow lg:col-span-2">
                <CardHeader>
                  <CardTitle>Dimensiones más Abordadas</CardTitle>
                  <CardDescription>Principales áreas de enfoque en los planes de gobierno</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(data.statistics.by_dimension)
                      .sort((a, b) => b[1].total_proposals - a[1].total_proposals)
                      .slice(0, 8)
                      .map(([dimension, stats], index) => (
                        <div
                          key={dimension}
                          className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                            <Badge variant="secondary">{stats.total_proposals}</Badge>
                          </div>
                          <p className="text-sm font-medium leading-tight">{dimension}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Radar Tab */}
          <TabsContent value="radar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Radar de Dimensiones por Partido
                </CardTitle>
                <CardDescription>
                  Análisis comparativo del enfoque de cada partido en las diferentes dimensiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger className="mb-6 max-w-md">
                    <SelectValue placeholder="Selecciona un partido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los partidos</SelectItem>
                    {data.parties.map(party => (
                      <SelectItem key={party} value={party}>{party}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedParty !== 'all' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        {selectedParty}
                      </h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={getRadarDataForParty(selectedParty)}>
                          <PolarGrid strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="dimension" fontSize={11} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Enfoque"
                            dataKey="value"
                            stroke={PARTY_COLORS[selectedParty as keyof typeof PARTY_COLORS] || '#8884d8'}
                            fill={PARTY_COLORS[selectedParty as keyof typeof PARTY_COLORS] || '#8884d8'}
                            fillOpacity={0.5}
                            strokeWidth={2}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                                    <p className="font-semibold">{payload[0].payload.fullDimension}</p>
                                    <p className="text-sm">Propuestas: {payload[0].payload.count}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Distribución por Dimensiones</h3>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3 pr-4">
                          {getRadarDataForParty(selectedParty)
                            .sort((a, b) => b.count - a.count)
                            .map((item, index) => (
                              <div
                                key={item.fullDimension}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">{item.fullDimension}</span>
                                  <Badge>{item.count} propuestas</Badge>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${item.value}%`,
                                      backgroundColor: PARTY_COLORS[selectedParty as keyof typeof PARTY_COLORS] || '#8884d8'
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {selectedParty === 'all' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.parties.map(party => (
                      <Card key={party} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base">{party}</CardTitle>
                          <CardDescription>
                            {data.statistics.by_party[party]?.total_proposals} propuestas
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={getRadarDataForParty(party)}>
                              <PolarGrid strokeDasharray="2 2" />
                              <PolarAngleAxis dataKey="dimension" fontSize={9} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar
                                name="Enfoque"
                                dataKey="value"
                                stroke={PARTY_COLORS[party as keyof typeof PARTY_COLORS] || '#8884d8'}
                                fill={PARTY_COLORS[party as keyof typeof PARTY_COLORS] || '#8884d8'}
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparativa de Madurez Promedio */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Nivel de Madurez Promedio</CardTitle>
                  <CardDescription>
                    Comparativa del nivel de detalle promedio de propuestas por partido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getComparisonData().sort((a, b) => b.avgMadurez - a.avgMadurez)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="party"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={11}
                      />
                      <YAxis domain={[0, 5]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const avgMadurez = payload[0]?.payload?.avgMadurez !== undefined
                              ? payload[0].payload.avgMadurez.toFixed(2)
                              : 'N/A';

                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                                <p className="font-semibold">{payload[0].payload.fullParty}</p>
                                <p className="text-sm">Madurez Promedio: {avgMadurez}/5</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgMadurez" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Categorías Top por Partido */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Categorías Principales por Partido
                  </CardTitle>
                  <CardDescription>
                    Distribución de propuestas por categoría tecnológica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedParty} onValueChange={setSelectedParty}>
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Selecciona un partido" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.parties.map(party => (
                        <SelectItem key={party} value={party}>{party}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedParty !== 'all' && (
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2 pr-4">
                        {getCategoryData(selectedParty).map((item, index) => (
                          <div
                            key={item.fullName}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                          >
                            <span className="text-sm flex-1 mr-2">{item.fullName}</span>
                            <Badge variant="secondary">{item.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {selectedParty === 'all' && (
                    <div className="text-center text-muted-foreground py-8">
                      Selecciona un partido para ver sus categorías principales
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen Comparativo */}
              <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Tabla Comparativa por Partido</CardTitle>
                  <CardDescription>
                    Resumen de métricas clave por cada partido político
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Partido</th>
                          <th className="text-center p-2 font-semibold">Propuestas</th>
                          <th className="text-center p-2 font-semibold">Dimensiones</th>
                          <th className="text-center p-2 font-semibold">Madurez</th>
                          <th className="text-center p-2 font-semibold">IA</th>
                          <th className="text-center p-2 font-semibold">Digital</th>
                          <th className="text-center p-2 font-semibold">IoT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.parties.map(party => {
                          const stats = data.statistics.by_party[party];
                          return (
                            <tr key={party} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="p-2 font-medium">{party}</td>
                              <td className="text-center p-2">
                                <Badge>{stats?.total_proposals || 0}</Badge>
                              </td>
                              <td className="text-center p-2">
                                {Object.keys(stats?.dimension_counts || {}).length}
                              </td>
                              <td className="text-center p-2">
                                <span className={`font-semibold ${
                                  (stats?.avg_madurez || 0) >= 4 ? 'text-green-600' :
                                  (stats?.avg_madurez || 0) >= 3 ? 'text-blue-600' :
                                  'text-orange-600'
                                }`}>
                                  {(stats?.avg_madurez || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="text-center p-2">{stats?.tech_counts?.IA || 0}</td>
                              <td className="text-center p-2">{stats?.tech_counts?.Digital || 0}</td>
                              <td className="text-center p-2">{stats?.tech_counts?.IoT || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="technology" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tech Mentions Bar Chart */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Menciones de Tecnologías</CardTitle>
                  <CardDescription>
                    Frecuencia de menciones de tecnologías clave en todas las propuestas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getTechMentionsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tech" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tech Mentions by Party */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Adopción Tecnológica por Partido</CardTitle>
                  <CardDescription>
                    Número de propuestas que mencionan tecnologías clave por partido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4 pr-4">
                      {data.parties.map(party => {
                        const stats = data.statistics.by_party[party];
                        const techTotal = Object.values(stats?.tech_counts || {}).reduce((a, b) => a + b, 0);
                        return (
                          <div key={party} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{party}</span>
                              <Badge>{techTotal} menciones</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(stats?.tech_counts || {})
                                .filter(([_, count]) => count > 0)
                                .map(([tech, count]) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}: {count}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Categories Distribution */}
              <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Distribución por Categorías Tecnológicas</CardTitle>
                  <CardDescription>
                    Número de propuestas por cada categoría tecnológica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(data.statistics.by_category)
                      .sort((a, b) => b[1].total_proposals - a[1].total_proposals)
                      .map(([category, stats], index) => (
                        <div
                          key={category}
                          className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-cyan-600">#{index + 1}</span>
                            <Badge>{stats.total_proposals}</Badge>
                          </div>
                          <p className="text-sm font-medium leading-tight">{category}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Propuestas Filtradas
                  </span>
                  <Badge variant="outline">{filteredProposals.length} propuestas</Badge>
                </CardTitle>
                <CardDescription>
                  {searchTerm || selectedParty !== 'all' || selectedDimension !== 'all' || selectedMadurez !== 'all'
                    ? 'Resultados filtrados'
                    : 'Todas las propuestas'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {currentProposals.map((proposal) => (
                      <Card
                        key={proposal.id}
                        className="hover:shadow-lg transition-all cursor-pointer border-l-4"
                        style={{
                          borderLeftColor: PARTY_COLORS[proposal.partido as keyof typeof PARTY_COLORS] || '#8884d8'
                        }}
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge
                                  style={{
                                    backgroundColor: PARTY_COLORS[proposal.partido as keyof typeof PARTY_COLORS] || '#8884d8',
                                    color: 'white'
                                  }}
                                >
                                  {proposal.partido}
                                </Badge>
                                <Badge variant="outline">{proposal.dimension}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {proposal.categoria}
                              </p>
                              <p className="text-base leading-relaxed">
                                "{proposal.cita}"
                              </p>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: getMadurezColor(proposal.madurez),
                                color: 'white',
                                fontWeight: 600
                              }}
                              className="shrink-0"
                            >
                              {MADUREZ_LABELS[proposal.madurez as keyof typeof MADUREZ_LABELS] || proposal.madurez}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            <p className="font-semibold text-base">Radar Digital - Plan de Gobierno Perú 2026</p>
            <p className="mt-1">Análisis de las propuestas tecnológicas de 10 partidos políticos</p>
            <p className="mt-2 text-xs">Datos extraídos del JNE y clasificados por IA</p>
          </div>

          {/* Disclaimer */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border border-amber-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold text-amber-800 dark:text-amber-500 mb-1">⚠️ Disclaimer</p>
                <p className="leading-relaxed">
                  El presente análisis se basa en la información pública contenida en los planes de gobierno presentados ante el Jurado Nacional de Elecciones (JNE). La clasificación de las propuestas por categorías tecnológicas y niveles de madurez ha sido realizada mediante inteligencia artificial y puede contener errores de interpretación. Este análisis no representa ninguna postura política ni afiliación partidaria. Se recomienda verificar directamente la información oficial en los documentos originales de cada partido. Los datos presentados son informativos y no constituyen una recomendación de voto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge
                    style={{
                      backgroundColor: PARTY_COLORS[selectedProposal.partido as keyof typeof PARTY_COLORS] || '#8884d8',
                      color: 'white'
                    }}
                    className="mb-2"
                  >
                    {selectedProposal.partido}
                  </Badge>
                  <h3 className="text-xl font-bold">{selectedProposal.dimension}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProposal(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Categoría Tecnológica</p>
                  <p className="font-medium">{selectedProposal.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nivel de Madurez</p>
                  <Badge
                    style={{
                      backgroundColor: getMadurezColor(selectedProposal.madurez),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    {MADUREZ_LABELS[selectedProposal.madurez as keyof typeof MADUREZ_LABELS] || selectedProposal.madurez}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Propuesta</p>
                  <p className="text-base leading-relaxed p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    "{selectedProposal.cita}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
