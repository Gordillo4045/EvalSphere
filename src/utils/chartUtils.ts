import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/config/config";
import { toast } from 'sonner';

export const generateChartData = async (companyId: string, employeeId: string) => {
    try {
        // Realizar todas las consultas principales en paralelo
        const [
            evaluationsSnapshot,
            employeesSnapshot,
            departmentsSnapshot,
            surveyQuestionsSnapshot
        ] = await Promise.all([
            getDocs(query(
                collection(db, `companies/${companyId}/evaluations`),
                where("evaluatedId", "==", employeeId)
            )),
            getDocs(collection(db, `companies/${companyId}/employees`)),
            getDocs(collection(db, `companies/${companyId}/departments`)),
            getDocs(collection(db, `companies/${companyId}/surveyQuestions`))
        ]);

        // Procesar datos de empleados
        const employeesData = Object.fromEntries(
            employeesSnapshot.docs.map(doc => [doc.id, doc.data()])
        );

        // Procesar datos de posiciones en paralelo
        const positionsSnapshots = await Promise.all(
            departmentsSnapshot.docs.map(deptDoc =>
                getDocs(collection(deptDoc.ref, 'positions'))
            )
        );

        const positionsData = Object.fromEntries(
            positionsSnapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => [doc.id, doc.data().level])
            )
        );

        // Procesar nombres de categorías
        const categoryNames = Object.fromEntries(
            surveyQuestionsSnapshot.docs.map(doc => [doc.id, doc.data().category])
        );

        // Crear un Map para los promedios
        const averages = new Map<string, Record<string, number[]>>();

        // Procesar evaluaciones
        for (const doc of evaluationsSnapshot.docs) {
            const evaluation = doc.data();
            const evaluatorPosition = employeesData[evaluation.evaluatorId]?.positionId;
            const evaluatedPosition = employeesData[employeeId]?.positionId;

            // Determinar tipo de evaluador
            const evaluatorType = evaluation.evaluatorId === employeeId
                ? "AutoEval"
                : evaluatorPosition === evaluatedPosition
                    ? "Companeros"
                    : (positionsData[evaluatorPosition] || 0) > (positionsData[evaluatedPosition] || 0)
                        ? "Jefe"
                        : "Subordinados";

            // Procesar calificaciones
            for (const [key, value] of Object.entries(evaluation)) {
                if (
                    typeof value === 'number' &&
                    key !== 'timestamp' &&
                    !['evaluatedId', 'evaluatorId', 'comments'].includes(key)
                ) {
                    const category = categoryNames[key] || key;

                    if (!averages.has(category)) {
                        averages.set(category, {
                            Jefe: [],
                            Companeros: [],
                            Subordinados: [],
                            AutoEval: []
                        });
                    }

                    averages.get(category)![evaluatorType].push(value);
                }
            }
        }

        // Calcular y retornar datos finales
        return Array.from(averages.entries())
            .map(([category, typeScores]) => ({
                category,
                ...Object.fromEntries(
                    Object.entries(typeScores)
                        .filter(([_, scores]) => scores.length > 0)
                        .map(([type, scores]) => [
                            type,
                            scores.reduce((a, b) => a + b) / scores.length
                        ])
                )
            }))
            .filter(data => Object.keys(data).length > 1);

    } catch (error) {
        console.error("Error al generar datos del gráfico:", error);
        toast.error("Error al cargar los datos del gráfico");
        throw error;
    }
};

