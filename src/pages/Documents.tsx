import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Trash, Download, MagnifyingGlass, Calendar } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  template_name: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Kategorie dokumentów
  const categories = [
    { id: 'all', name: 'Wszystkie', icon: '📋', color: 'sky' },
    { id: 'employment', name: 'Zatrudnienie', icon: '💼', color: 'blue' },
    { id: 'government', name: 'Rząd/KVK', icon: '🏛️', color: 'indigo' },
    { id: 'tax', name: 'Podatki', icon: '💰', color: 'green' },
    { id: 'business', name: 'Biznes', icon: '📧', color: 'cyan' },
    { id: 'legal', name: 'Prawne', icon: '⚖️', color: 'purple' },
    { id: 'hr', name: 'HR', icon: '👥', color: 'pink' },
    { id: 'marketing', name: 'Marketing', icon: '📢', color: 'orange' },
    { id: 'reports', name: 'Raporty', icon: '📊', color: 'teal' },
  ];

  // Load documents from database
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // TODO: Load from database
      // const docs = await window.electronAPI?.database?.getDocuments();
      
      // MOCK DATA dla testu
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Umowa o pracę - Jan Kowalski',
          template_name: 'Arbeidsovereenkomst',
          category: 'employment',
          content: 'Treść umowy...',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'CV - Maria Nowak',
          template_name: 'CV Professioneel',
          category: 'employment',
          content: 'Treść CV...',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Błąd wczytywania dokumentów');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dokument?')) return;
    
    try {
      // TODO: Delete from database
      // await window.electronAPI?.database?.deleteDocument(id);
      
      setDocuments(documents.filter(d => d.id !== id));
      toast.success('Dokument usunięty');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Błąd usuwania dokumentu');
    }
  };

  const handleExport = (document: Document) => {
    // TODO: Export to PDF
    toast.info(`Export "${document.name}" - wkrótce!`);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-2 tracking-tight">
            📄 Dokumenty
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Twórz profesjonalne dokumenty biznesowe
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/documents/new'}
          className="bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg"
        >
          <Plus size={20} weight="bold" className="mr-2" />
          Nowy dokument
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2 border-sky-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Szukaj dokumentów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-sky-300 focus:border-sky-500"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-white border-2 border-sky-200 text-gray-700 hover:border-sky-400'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Ładowanie dokumentów...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-2 border-dashed border-sky-300">
          <CardContent className="p-12 text-center">
            <FileText size={64} className="mx-auto text-sky-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nie znaleziono dokumentów' 
                : 'Brak dokumentów'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Spróbuj zmienić kryteria wyszukiwania'
                : 'Stwórz swój pierwszy dokument z gotowego szablonu'}
            </p>
            <Button
              onClick={() => window.location.href = '/documents/new'}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Plus size={20} className="mr-2" />
              Nowy dokument
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const category = categories.find(c => c.id === doc.category);
            return (
              <Card 
                key={doc.id}
                className="border-2 border-sky-200 hover:border-sky-500 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => window.location.href = `/documents/${doc.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{category?.icon || '📄'}</span>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded font-semibold">
                          {category?.name || 'Inne'}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {doc.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Szablon: {doc.template_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>{new Date(doc.created_at).toLocaleDateString('pl-PL')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(doc);
                      }}
                      className="flex-1 bg-white border-2 border-sky-400 text-sky-700 hover:bg-sky-50"
                    >
                      <Download size={16} className="mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      variant="destructive"
                      className="px-3"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-sky-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-sky-600">{documents.length}</div>
              <div className="text-sm text-gray-600 mt-1">Wszystkich</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {documents.filter(d => d.category === 'employment').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Zatrudnienie</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {documents.filter(d => d.category === 'tax').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Podatki</div>
            </CardContent>
          </Card>
          <Card className="border-cyan-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-cyan-600">
                {documents.filter(d => d.category === 'business').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Biznes</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
