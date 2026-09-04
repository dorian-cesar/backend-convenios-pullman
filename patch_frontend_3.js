const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = 'C:\\Users\\EQUIPO1\\Desktop\\front-mantenedor-convenios-pullman';
const pagePath = path.join(FRONTEND_DIR, 'app/dashboard/convenios/page.tsx');

if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');

    // 1. Add Switch import if missing
    if (!content.includes('import { Switch }')) {
        content = content.replace('import { Button } from "@/components/ui/button"', 'import { Button } from "@/components/ui/button"\nimport { Switch } from "@/components/ui/switch"');
    }

    // 2. Add TableHead for Inscripción
    if (!content.includes('<Table.TableHead>Inscripción</Table.TableHead>')) {
        content = content.replace('<Table.TableHead>Beneficio</Table.TableHead>', '<Table.TableHead>Beneficio</Table.TableHead>\n                            <Table.TableHead>Inscripción</Table.TableHead>');
    }

    // 3. Add TableCell with Switch for Inscripción
    const switchCell = `<Table.TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                checked={!!convenio.inscripcion_activa} 
                                                onCheckedChange={async (val) => {
                                                    try {
                                                        await ConveniosService.patchConvenio(convenio.id, { inscripcion_activa: val });
                                                        fetchConvenios();
                                                        toast.success(val ? "Inscripción habilitada" : "Inscripción deshabilitada");
                                                    } catch (error) {
                                                        toast.error("Error al cambiar estado de inscripción");
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Table.TableCell>`;
    
    // The exact text before where we want to insert
    const beneficioCell = `<Table.TableCell>
                                        {convenio.beneficio
                                            ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Sí</span>
                                            : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No</span>
                                        }
                                    </Table.TableCell>`;
    
    // Actually, because of possible encoding differences in the "Sí", we should use regex or a robust replace
    const cellRegex = /<Table\.TableCell>\s*\{convenio\.beneficio\s*\?\s*<span[^>]*>SÃ­<\/span>\s*:\s*<span[^>]*>No<\/span>\s*\}\s*<\/Table\.TableCell>/;
    const fallbackCellRegex = /<Table\.TableCell>\s*\{convenio\.beneficio\s*\?\s*<span[^>]*>S[iíí]<\/span>\s*:\s*<span[^>]*>No<\/span>\s*\}\s*<\/Table\.TableCell>/;

    if (!content.includes('onCheckedChange={async (val) => {')) {
        let match = content.match(fallbackCellRegex) || content.match(cellRegex);
        if (match) {
             content = content.replace(match[0], match[0] + '\n                                    ' + switchCell);
        } else {
             // Let's use a simpler string replace on something nearby if regex fails
             content = content.replace('<Table.TableCell>{(convenio.limitar_por_monto', switchCell + '\n                                    <Table.TableCell>{(convenio.limitar_por_monto');
        }
    }

    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('✅ app/dashboard/convenios/page.tsx modificado exitosamente');
} else {
    console.log('❌ no se encontró ' + pagePath);
}
