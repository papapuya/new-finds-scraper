import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Shield, Clock, FileSpreadsheet, TrendingDown, Shuffle } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const stats = [
    {
      value: "10.000+",
      label: "Produkte in Minuten verarbeitet",
      icon: FileSpreadsheet
    },
    {
      value: "95%",
      label: "Weniger manuelle Arbeit",
      icon: TrendingDown
    },
    {
      value: "Alle",
      label: "MediaMarkt, Brickfox & mehr",
      icon: Shuffle
    },
    {
      value: "2-5 Min",
      label: "Statt 4-8 Stunden pro Produkt",
      icon: Clock
    }
  ];

  const problems = [
    {
      icon: FileSpreadsheet,
      title: "Endlose Excel-Arbeit",
      description: "Stunden über Stunden mit Copy-Paste, Formatieren und manuellen Anpassungen. Deine wertvolle Zeit geht für repetitive Aufgaben drauf."
    },
    {
      icon: TrendingUp,
      title: "Chaos bei Plattform-Mappings",
      description: "Jede Plattform will andere Felder. MediaMarkt, Brickfox, Channel-Engine – alle haben ihre eigenen Anforderungen. Ein Alptraum ohne System."
    },
    {
      icon: Shield,
      title: "Inkonsistente Produkttexte",
      description: "Mal gut, mal schlecht. Keine einheitliche Qualität. SEO-Optimierung? Fehlanzeige. Deine Produkte verschwinden in der Masse."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto animate-fade-in">
            Produktdaten-Management neu gedacht –{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Automatisiert, intelligent, zeitsparend
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in">
            Schluss mit manuellen Excel-Marathons und endlosen Copy-Paste-Aufgaben.
            Unser Produktdaten-Manager automatisiert deine Produkttexte, Mappings und
            Exporte – in Sekunden statt Stunden.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/scraper')}
            >
              Kostenlos starten
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => {
                const statsSection = document.getElementById('stats');
                statsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Produktdaten-Management in Zahlen
            </h2>
            <p className="text-lg text-muted-foreground">
              Erlebe echte Zeitersparnis und Effizienz bei deiner täglichen Arbeit
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kennst du diese Probleme?
            </h2>
            <p className="text-lg text-muted-foreground">
              Typische Herausforderungen im Produktdaten-Management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/scraper')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Jetzt Probleme lösen
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
