const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = 'C:\\Users\\EQUIPO1\\Desktop\\front-mantenedor-convenios-pullman';
const filesToPatch = [
    'components/modals/add-convenio.tsx',
    'components/modals/update-convenio.tsx'
];

const ZOD_REPLACE = `beneficio: z.boolean().optional(),
    inscripcion_activa: z.boolean().default(false).optional(),
    fecha_inicio_inscripcion: z.string().optional().nullable(),
    fecha_fin_inscripcion: z.string().optional().nullable(),`;

const UI_BLOCK = `
                        {/* Inscripción */}
                        <Form.FormField control={form.control} name="inscripcion_activa" render={({ field }) => (
                            <Form.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10">
                                <div className="space-y-0.5">
                                    <Form.FormLabel className="text-sm font-medium">Habilitar Formulario de Inscripción</Form.FormLabel>
                                </div>
                                <Form.FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </Form.FormControl>
                            </Form.FormItem>
                        )} />

                        {form.watch("inscripcion_activa") && (
                            <div className="grid grid-cols-2 gap-4 border rounded-md p-4 bg-muted/30">
                                <Form.FormField control={form.control} name="fecha_inicio_inscripcion" render={({ field }) => (
                                    <Form.FormItem>
                                        <Form.FormLabel className="text-xs">Inicio de inscripción</Form.FormLabel>
                                        <Form.FormControl>
                                            <Input type="date" {...field} value={field.value ? field.value.split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value || null)} className="h-9" />
                                        </Form.FormControl>
                                        <Form.FormMessage />
                                    </Form.FormItem>
                                )} />
                                <Form.FormField control={form.control} name="fecha_fin_inscripcion" render={({ field }) => (
                                    <Form.FormItem>
                                        <Form.FormLabel className="text-xs">Fin de inscripción</Form.FormLabel>
                                        <Form.FormControl>
                                            <Input type="date" {...field} value={field.value ? field.value.split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value || null)} className="h-9" />
                                        </Form.FormControl>
                                        <Form.FormMessage />
                                    </Form.FormItem>
                                )} />
                            </div>
                        )}
                        
                        {/* Beneficio */}`;

filesToPatch.forEach(relPath => {
    const fullPath = path.join(FRONTEND_DIR, relPath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Add Switch import
    if (!content.includes('import { Switch }')) {
        content = content.replace('import { Checkbox } from "@/components/ui/checkbox"', 'import { Checkbox } from "@/components/ui/checkbox"\nimport { Switch } from "@/components/ui/switch"');
    }

    // 2. Patch Zod Schema
    // For Zod schema, string replace is safer
    if (!content.includes('inscripcion_activa: z.boolean()')) {
        content = content.replace('beneficio: z.boolean().optional(),', ZOD_REPLACE);
    }

    // 3. Patch UI
    if (!content.includes('Habilitar Formulario de Inscripción')) {
        content = content.replace('{/* Beneficio */}', UI_BLOCK);
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✅ ' + relPath + ' modificado exitosamente');
});
