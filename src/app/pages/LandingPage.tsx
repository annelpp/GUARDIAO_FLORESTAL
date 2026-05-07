import { Link } from 'react-router';
import { 
  TreePine, ShieldCheck, Smartphone, Cpu, 
  FlameKindling, Map, CheckCircle2, ArrowRight,
  Database, LineChart, AlertCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { motion } from 'motion/react';

// Importação das imagens anexadas
import imgHeroPaisagem from '@/app/assets/images/paisagem.png';
import imgProblemaArvore1 from '@/app/assets/images/arvore1.png';
import imgDiferencialConnect from '@/app/assets/images/arvore_connect.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION: O GUARDIÃO FLORESTAL --- */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-green-50 to-white">
        {/* Imagem de Fundo (Paisagem) com Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={imgHeroPaisagem} 
            alt="Paisagem Florestal Nobre" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100 border-green-200 py-1 px-4">
                Proteção Ambiental Inteligente
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
                Guardião Florestal <br />
                <span className="text-green-600">Digital</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Uma solução inovadora que une tecnologia e sustentabilidade para proteger 
                florestas nobres contra queimadas e extração ilegal de madeira.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto">
                    Acessar Sistema <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto bg-white/80 backdrop-blur-sm">
                  Ver Demonstração
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: O PROBLEMA --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="text-red-500" /> O Problema
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                As florestas de madeira nobre enfrentam ameaças constantes. A fiscalização manual é 
                lenta, perigosa e muitas vezes ineficaz contra o desmatamento ilegal 
                e incêndios que se espalham em minutos.
              </p>
              <ul className="space-y-4">
                {[
                  "Falta de rastreabilidade individual de árvores nobres.",
                  "Demora na detecção de focos de incêndio.",
                  "Dificuldade em comprovar a origem legal da madeira."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="size-2 bg-red-400 rounded-full" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Imagem: Árvore1 (Ipê Roxo) representando a mata nobre */}
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-video border border-gray-100">
                <img 
                    src={imgProblemaArvore1} 
                    alt="Árvore Nobre (Ipê Roxo) na floresta" 
                    className="w-full h-full object-cover"
                />
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: TECNOLOGIA NFC + IOT (Fundo Escuro do PDF) --- */}
      <section className="py-24 bg-green-900 text-white relative overflow-hidden">
        {/* Leve overlay de textura de floresta */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src={imgHeroPaisagem} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">Uso de Tecnologia NFC + IoT para Preservação</h2>
            <p className="text-green-100 text-lg">
              Transformamos árvores em pontos inteligentes de monitoramento conectando 
              o mundo físico ao digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-green-800/50 border-green-700 text-white">
              <CardContent className="pt-8 text-center">
                <div className="size-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-700/50">
                  <Smartphone className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-400 text-center">NFC</h3>
                <p className="text-green-100 text-sm leading-relaxed">
                  Cada árvore recebe uma identidade digital única via etiqueta física. Ao aproximar o celular, 
                  acesso imediato a espécie, idade e localização exata.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-800/50 border-green-700 text-white">
              <CardContent className="pt-8 text-center">
                <div className="size-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-700/50">
                  <Cpu className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-400 text-center">Sensores IoT (ESP32)</h3>
                <p className="text-green-100 text-sm leading-relaxed">
                  Monitoramento térmico e de vibração em tempo real. O sensor valida 
                  continuamente que a árvore está no local e segura.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-800/50 border-green-700 text-white">
              <CardContent className="pt-8 text-center">
                <div className="size-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-700/50">
                  <ShieldCheck className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-400 text-center">Cerca Digital</h3>
                <p className="text-green-100 text-sm leading-relaxed">
                  Um perímetro de segurança invisível que gera alertas instantâneos 
                  em caso de qualquer anomalia, fogo ou tentativa de remoção.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: O DIFERENCIAL ÚNICO --- */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid lg:grid-cols-2">
              {/* Imagem: Arvore_Connect (Conceito de Prova Viva) */}
              <div className="relative">
                <img 
                    src={imgDiferencialConnect} 
                    alt="Smartphone bipando o NFC e conectando ao sensor IoT da árvore" 
                    className="w-full h-full object-cover lg:absolute lg:inset-0"
                />
              </div>
              
              <div className="p-12 lg:p-16">
                <Badge className="bg-blue-100 text-blue-700 mb-4">Inovação</Badge>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 leading-tight">Selo de Origem em Tempo Real</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Diferente de selos de papel ou digitais estáticos que podem ser fraudados, nosso sistema 
                  oferece a <strong>"Prova Viva"</strong>. A identidade da árvore só é 
                  validada se o sensor físico confirmar os dados em tempo real via Bluetooth.
                </p>
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <CheckCircle2 className="size-5" /> Autenticidade Garantida
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: FUNCIONALIDADES --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Funcionalidades do Sistema</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Map, title: "Geolocalização", desc: "Mapa interativo com a posição exata de cada árvore monitorada." },
              { icon: FlameKindling, title: "Alerta de Fogo", desc: "Sensores de calor com aviso instantâneo via internet." },
              { icon: LineChart, title: "Analytics", desc: "Gráficos de histórico de temperatura e saúde individual." },
              { icon: Database, title: "Inventário Digital", desc: "Banco de dados completo e histórico auditável por árvore." }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border bg-white hover:border-green-300 hover:shadow-md transition-all group">
                <f.icon className="size-10 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold mb-2 text-gray-900">{f.title}</h4>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <TreePine className="size-8 text-green-500" />
            <span className="text-white text-xl font-bold uppercase tracking-widest">Guardião Florestal</span>
          </div>
          <p className="mb-4">Desenvolvido com 💚 para preservação e manejo das nossas florestas nobres.</p>
          <div className="text-sm">©️ 2026 Cerca Digital Inteligente. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
}