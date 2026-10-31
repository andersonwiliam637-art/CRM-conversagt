import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import {
  Wrench,
  Car,
  Pill,
  Utensils,
  Home,
  Shirt,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Zap
} from 'lucide-react';

interface BusinessTemplatesSectionProps {
  onAddDocument: (doc: Partial<DocumentItem>) => void;
  isZeroHallucinationActive: boolean;
  onToggleZeroHallucination: () => void;
}

interface TemplateDef {
  key: 'ferreteria' | 'repuestos' | 'clinica' | 'restaurante' | 'inmobiliaria' | 'moda';
  title: string;
  categoryName: string;
  icon: React.ReactNode;
  badge: string;
  accentColor: string;
  shortDesc: string;
  highlightItems: string[];
  fullContent: string;
}

export const BusinessTemplatesSection: React.FC<BusinessTemplatesSectionProps> = ({
  onAddDocument,
  isZeroHallucinationActive,
  onToggleZeroHallucination
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [installedNotice, setInstalledNotice] = useState<string | null>(null);

  const templates: TemplateDef[] = [
    {
      key: 'ferreteria',
      title: 'Ferretería & Construcción',
      categoryName: 'Materiales & Herramientas',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      badge: 'Más Vendida',
      accentColor: 'border-amber-500/30 hover:border-amber-500/60',
      shortDesc: 'Cemento Progreso, varilla de hierro, taladros 20V, pintura látex, tubería PVC y fletes.',
      highlightItems: [
        'Cemento Progreso 50kg (Q82.00)',
        'Varilla Hierro 3/8" Grado 40 (Q48.50)',
        'Taladro Percutor 20V Brushless (Q675.00)',
        'Pintura Látex Lavable Cubeta 5G (Q385.00)'
      ],
      fullContent: `🏗️ CATÁLOGO DE FERRETERÍA & MATERIALES DE CONSTRUCCIÓN GUATEMALA
UBICACIÓN Y ENVÍOS: Despacho a todo el país vía camión propio o flete Guatex/Cargo Expreso (Q35 periférico / flete camión cotizado por peso).

LISTA DE PRECIOS OFICIALES:
1. Cemento Progreso Especial Uso General (Saco 50kg): Q82.00
2. Varilla de Hierro Corrugado 3/8" Grado 40 (Tira 6m): Q48.50
3. Varilla de Hierro Corrugado 1/2" Grado 40 (Tira 6m): Q84.00
4. Taladro Percutor Inalámbrico 20V Brushless (Incluye 2 baterías y cargador): Q675.00
5. Pulidora Angular 4-1/2" Industrial 850W: Q395.00
6. Pintura Látex Lavable Blanca (Cubeta 5 galones): Q385.00
7. Tubo PVC Presión 1/2" 160 PSI (Tira 6 metros): Q24.00
8. Tubo PVC Drenaje 3" Norma (Tira 3 metros): Q58.00
9. Alambre de Amarre Negro (Libra): Q7.50
10. Clavo para Lámina con Arandela de Neopreno (Libra): Q12.00
11. Lámina Galvanizada Calibre 28 (10 pies): Q115.00

DESCUENTOS POR VOLUMEN:
- Descuento del 5% en compras mayores a Q5,000 en materiales de obra gris.
- Flete gratis dentro del perímetro de la Ciudad de Guatemala en pedidos mayores a Q2,500.

FORMAS DE PAGO ACEPTADAS:
- Transferencia a Banco Industrial (Ahorro No. 1402158 a nombre de Anderson William).
- Transferencia a BAM Banco Agromercantil (Ahorro No. 4030437443 a nombre de Anderson William).
- Enlace seguro de pago con tarjeta o PayPal: andersonwiliam637@gmail.com.
- Se emite Factura Electrónica SAT (DTE / FEL) con el NIT de su empresa.`
    },
    {
      key: 'repuestos',
      title: 'Repuestos Automotrices & Taller',
      categoryName: 'Mecánica & Autopartes',
      icon: <Car className="w-5 h-5 text-blue-400" />,
      badge: 'Alta Demanda',
      accentColor: 'border-blue-500/30 hover:border-blue-500/60',
      shortDesc: 'Frenos, amortiguadores, aceites sintéticos 5W-30, bujías y baterías para marcas japonesas y coreanas.',
      highlightItems: [
        'Pastillas Cerámicas Hilux/Fortuner (Q285.00)',
        'Aceite Sintético 5W-30 + Filtro (Q275.00)',
        'Amortiguador de Gas Heavy Duty (Q450.00)',
        'Batería 12V 13 Placas con Garantía (Q680.00)'
      ],
      fullContent: `🚗 REPUESTOS AUTOMOTRICES & TALLER MECÁNICO MULTIMARCA GUATEMALA
ESPECIALISTAS EN: Toyota, Nissan, Hyundai, Kia, Honda, Mazda y Mitsubishi.

LISTA DE REPUESTOS Y PRECIOS:
1. Pastillas de Freno Cerámicas Delanteras (Toyota Hilux / Fortuner 2016-2024): Q285.00
2. Pastillas de Freno Semimetálicas (Nissan NP300 / Frontier): Q240.00
3. Amortiguador Delantero de Gas Heavy Duty (Unidad con 1 año de garantía): Q450.00
4. Aceite Sintético 5W-30 Full Synthetic (Galón) + Filtro de Aceite original: Q275.00
5. Batería Automotriz 12V 13 Placas con 18 meses de garantía (dejando usada): Q680.00
6. Kit de Embrague / Clutch Completo (Disco, Prensa y Collarín): Q1,150.00
7. Bujías de Iridio Larga Duración (Juego de 4 unidades): Q220.00
8. Filtro de Aire de Cabina / Motor: Q95.00

SERVICIOS DE TALLER:
- Servicio Menor (Aceite, filtro, revisión de 21 puntos y escáner OBD2): Q390.00
- Servicio de Frenos Completo (Rectificación de 2 discos + pastillas + purgado): Q480.00

PAGOS: Transferencia BI (1402158), BAM (4030437443) o tarjeta. Factura SAT FEL inmediata.`
    },
    {
      key: 'clinica',
      title: 'Clínica Médica & Odontología',
      categoryName: 'Salud & Citas Médicas',
      icon: <Pill className="w-5 h-5 text-emerald-400" />,
      badge: 'Servicios',
      accentColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      shortDesc: 'Consultas médicas, limpieza dental ultrasonido, ortodoncia, extracciones y citas.',
      highlightItems: [
        'Consulta Médica General (Q200.00)',
        'Limpieza Dental + Flúor (Q250.00)',
        'Blanqueamiento Láser 1 Sesión (Q850.00)',
        'Ortodoncia Enganche Inicial (Q1,200.00)'
      ],
      fullContent: `🦷 CLÍNICA MÉDICA INTEGRAL & ODONTOLOGÍA ESPECIALIZADA
DIRECCIÓN: Edificio Plaza Médica, Nivel 5, Clínica 504, Zona 10, Ciudad de Guatemala.
HORARIO: Lunes a Viernes 8:00 AM - 6:00 PM | Sábados 8:00 AM - 1:00 PM.

TARIFAS DE PROCEDIMIENTOS:
1. Consulta Médica Diagnóstica / Evaluación: Q200.00
2. Limpieza Dental con Ultrasonido + Profilaxis + Flúor: Q250.00
3. Blanqueamiento Dental Láser en 1 Sesión (60 minutos): Q850.00
4. Resina / Relleno Estético de Calidad (Por pieza): Q180.00
5. Extracción Simple: Q200.00 | Extracción de Cordal / Tercer Molar: Q650.00
6. Ortodoncia (Frenillos Metálicos): Enganche Q1,200 + Mensualidades de Q350.00

RESERVA DE CITAS:
- Se aparta enviando Nombre completo, DPI y fecha deseada.
- Anticipo de confirmación de Q100 aplicable a la consulta a Banco Industrial (1402158) o BAM (4030437443).`
    },
    {
      key: 'restaurante',
      title: 'Restaurante Gourmet & Delivery',
      categoryName: 'Alimentos & Bebidas',
      icon: <Utensils className="w-5 h-5 text-rose-400" />,
      badge: 'Delivery Rápido',
      accentColor: 'border-rose-500/30 hover:border-rose-500/60',
      shortDesc: 'Desayunos chapines, puyaso importado, hamburguesas angus, parrilladas y cobertura.',
      highlightItems: [
        'Desayuno Chapín Completo (Q45.00)',
        'Puyaso Importado Choice 10oz (Q135.00)',
        'Hamburguesa Angus Doble Queso (Q68.00)',
        'Parrillada Familiar 4 personas (Q320.00)'
      ],
      fullContent: `🍽️ MENÚ Y DELIVERY RESTAURANTE GOURMET GUATEMALA
HORARIOS: Lunes a Domingo 7:00 AM - 10:00 PM.
COBERTURA DELIVERY: Zonas 1, 4, 9, 10, 14, 15 y Carretera a El Salvador (Envío Q25 o gratis sobre Q150).

DESAYUNOS (7:00 AM - 11:30 AM):
- Desayuno Chapín Clásico: 2 huevos al gusto, frijoles volteados, plátanos con crema, queso de capas y tortillas calientes: Q45.00
- Omelette Gourmet Champiñones & Espinaca + Café Ilimitado: Q52.00

PLATOS FUERTES:
- Puyaso Importado Choice 10oz con Papa Asada y Cebollines: Q135.00
- Hamburguesa Artesanal Angus Doble Queso Cheddar + Papas Rústicas: Q68.00
- Pechuga de Pollo en Salsa de Champiñones + Ensalada César: Q62.00
- Parrillada Familiar para 4 (Carne, Pollo, Longanizas, Frijoles, Chirmol): Q320.00

PAGOS: Contra entrega en efectivo, POS de tarjeta inalámbrico, o transferencia BI/BAM.`
    },
    {
      key: 'inmobiliaria',
      title: 'Inmobiliaria & Preventa',
      categoryName: 'Bienes Raíces',
      icon: <Home className="w-5 h-5 text-indigo-400" />,
      badge: 'Alto Ticket',
      accentColor: 'border-indigo-500/30 hover:border-indigo-500/60',
      shortDesc: 'Apartamentos en preventa, enganche fraccionado, amenidades y precalificación FHA.',
      highlightItems: [
        'Modelo Studio 42m² (Desde Q540,000)',
        'Modelo Familiar 3 Habitaciones (Desde Q895,000)',
        'Enganche fraccionado hasta en 20 meses',
        'Amenidades: Piscina infinity, gym y coworking'
      ],
      fullContent: `🏢 PROYECTOS INMOBILIARIOS & RESIDENCIALES GUATEMALA 2026
PROYECTO: 'Torres del Valle' (Zona 11 / Las Majadas)

MODELOS EN PREVENTA:
1. Modelo Studio (1 Habitación, 1 Baño, 1 Parqueo, 42 m²): Desde Q540,000.00
   - Enganche del 10% (Q54,000) fraccionado en 18 cuotas de Q3,000 sin intereses.
2. Modelo Familiar (3 Habitaciones, 2 Baños, 2 Parqueos, 86 m²): Desde Q895,000.00
   - Enganche fraccionado en 20 cuotas de Q4,475. Cuota bancaria estimada: Q5,800/mes (FHA).

AMENIDADES:
- Piscina climatizada, gimnasio de 2 niveles, coworking, pet park y seguridad biométrica.

REQUISITOS PRECALIFICACIÓN BANCARIA INMEDIATA:
- Ingreso individual o mancomunado mínimo de Q15,000. DPI, RTU y 3 últimos estados de cuenta.`
    },
    {
      key: 'moda',
      title: 'Boutique de Ropa & Calzado',
      categoryName: 'Moda & E-Commerce',
      icon: <Shirt className="w-5 h-5 text-pink-400" />,
      badge: 'E-commerce',
      accentColor: 'border-pink-500/30 hover:border-pink-500/60',
      shortDesc: 'Jeans levanta cola, vestidos de fiesta, blazers ejecutivos, guía de tallas y cambios.',
      highlightItems: [
        'Jeans Colombianos Levanta Cola (Q285.00)',
        'Vestido de Gala Corte Sirena (Q390.00)',
        'Blazer Ejecutivo Slim Fit (Q260.00)',
        'Zapatillas Tacón Alto Confort (Q225.00)'
      ],
      fullContent: `👗 TIENDA DE MODA & VESTIMENTA EXCLUSIVA GUATEMALA
ENVÍOS: Despacho a todos los departamentos vía Cargo Expreso o Guatex en 24 a 48 horas (Q35).

CATÁLOGO PRINCIPAL:
1. Jeans Colombianos Levanta Cola con Control de Abdomen (Tallas 6, 8, 10, 12): Q285.00
2. Vestido de Fiesta / Gala Corte Sirena (Tallas S, M, L): Q390.00
3. Blazer Ejecutivo Slim Fit con Forro Satinado: Q260.00
4. Zapatillas / Sandalias de Tacón Alto Confort (Tallas 35 a 39): Q225.00
5. Conjunto Deportivo Legging + Top Seamless Dry Fit: Q195.00

GUÍA DE TALLAS:
- S: Busto 85-89cm | Cintura 65-69cm | Cadera 90-94cm
- M: Busto 90-95cm | Cintura 70-75cm | Cadera 95-100cm
- L: Busto 96-102cm | Cintura 76-82cm | Cadera 101-108cm

POLÍTICAS DE CAMBIO:
- Cambios dentro de los primeros 7 días hábiles con etiqueta original puesta.
PAGOS: Contra entrega en efectivo, tarjetas o transferencia Banco Industrial / BAM.`
    }
  ];

  const handleInstall = (tpl: TemplateDef) => {
    const newDoc: Partial<DocumentItem> = {
      title: `Catálogo Oficial: ${tpl.title}`,
      category: 'product_catalog',
      fileType: 'markdown',
      size: `${(tpl.fullContent.length / 1024).toFixed(1)} KB`,
      chunksCount: Math.ceil(tpl.fullContent.length / 280),
      status: 'indexed',
      content: tpl.fullContent,
      description: tpl.shortDesc
    };

    onAddDocument(newDoc);
    setInstalledNotice(`¡Plantilla "${tpl.title}" instalada con éxito! Tu Bot de WhatsApp ya responde sobre estos productos con IA Gemini.`);
    setTimeout(() => setInstalledNotice(null), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Zero-Hallucination & Anti-Exploit Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-xs lg:text-sm">
                Escudo Anti-Alucinación (Fidelidad 100% Estricta)
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                isZeroHallucinationActive
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isZeroHallucinationActive ? 'ACTIVADO' : 'MODERADO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isZeroHallucinationActive
                ? 'El bot responde ÚNICAMENTE con los datos y precios verificados de tus documentos. Jamás inventará precios ni existencias.'
                : 'El bot responde con conocimiento general complementario si no encuentra el dato exacto.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleZeroHallucination}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            isZeroHallucinationActive
              ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-md shadow-purple-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          {isZeroHallucinationActive ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Modo Estricto Activo</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Activar Modo Estricto</span>
            </>
          )}
        </button>
      </div>

      {/* Installed Toast Notice */}
      {installedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{installedNotice}</span>
        </div>
      )}

      {/* Templates Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Plantillas de Negocio Pre-Configuradas (1 Clic para tu Empresa)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Instala catálogos listos para usar con productos, precios en Quetzales y cuentas bancarias locales.
          </p>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const isExpanded = expandedKey === tpl.key;
          return (
            <div
              key={tpl.key}
              className={`p-4 rounded-3xl luxury-glass border ${tpl.accentColor} flex flex-col justify-between space-y-3 transition-all`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {tpl.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                    {tpl.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{tpl.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {tpl.shortDesc}
                  </p>
                </div>

                {/* Highlighted items pill list */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ejemplos incluidos:
                  </span>
                  {tpl.highlightItems.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Full Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-2 animate-in fade-in">
                    <p className="font-mono text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {tpl.fullContent}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedKey(isExpanded ? null : tpl.key)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>{isExpanded ? 'Ocultar' : 'Ver Detalle'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInstall(tpl)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>+ Instalar (1 Clic)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
