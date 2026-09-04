const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = 'C:\\Users\\EQUIPO1\\Desktop\\front-mantenedor-convenios-pullman';

// 1. Modificar services/convenio.service.ts
const servicePath = path.join(FRONTEND_DIR, 'services/convenio.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Interface Convenio
serviceContent = serviceContent.replace(
    /fecha_termino\?: string;/,
    'fecha_termino?: string;\n    inscripcion_activa?: boolean;\n    fecha_inicio_inscripcion?: string | null;\n    fecha_fin_inscripcion?: string | null;\n    inscription?: boolean;'
);

// Interface CreateConvenioData
serviceContent = serviceContent.replace(
    /fecha_termino\?: string;(\s+)rutas\?: Ruta\[\];/,
    'fecha_termino?: string;$1inscripcion_activa?: boolean;$1fecha_inicio_inscripcion?: string | null;$1fecha_fin_inscripcion?: string | null;$1rutas?: Ruta[];'
);

// Interface UpdateConvenioData
serviceContent = serviceContent.replace(
    /fecha_termino\?: string \| null;(\s+)rutas\?: Ruta\[\] \| null;/,
    'fecha_termino?: string | null;$1inscripcion_activa?: boolean;$1fecha_inicio_inscripcion?: string | null;$1fecha_fin_inscripcion?: string | null;$1rutas?: Ruta[] | null;'
);

// Method mapConvenioToUpdateData
serviceContent = serviceContent.replace(
    /fecha_termino: convenio.fecha_termino \|\| null,/,
    'fecha_termino: convenio.fecha_termino || null,\n            inscripcion_activa: convenio.inscripcion_activa ?? false,\n            fecha_inicio_inscripcion: convenio.fecha_inicio_inscripcion || null,\n            fecha_fin_inscripcion: convenio.fecha_fin_inscripcion || null,'
);

fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('✅ services/convenio.service.ts modificado');

// 2. Modificar hooks/use-convenio-form.ts
const hookPath = path.join(FRONTEND_DIR, 'hooks/use-convenio-form.ts');
let hookContent = fs.readFileSync(hookPath, 'utf8');

hookContent = hookContent.replace(
    /if \(finalPayload.fecha_termino\) \{(\s+)finalPayload.fecha_termino = ensureUTC\(finalPayload.fecha_termino, true\);(\s+)\}/,
    'if (finalPayload.fecha_termino) {$1finalPayload.fecha_termino = ensureUTC(finalPayload.fecha_termino, true);$2}\n            if (finalPayload.fecha_inicio_inscripcion) {\n                finalPayload.fecha_inicio_inscripcion = ensureUTC(finalPayload.fecha_inicio_inscripcion);\n            }\n            if (finalPayload.fecha_fin_inscripcion) {\n                finalPayload.fecha_fin_inscripcion = ensureUTC(finalPayload.fecha_fin_inscripcion, true);\n            }'
);

fs.writeFileSync(hookPath, hookContent, 'utf8');
console.log('✅ hooks/use-convenio-form.ts modificado');
