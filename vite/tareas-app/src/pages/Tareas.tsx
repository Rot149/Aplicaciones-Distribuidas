import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { addOutline, trashOutline } from 'ionicons/icons';
import { useTareas } from '../hooks/useTareas';

const Tareas: React.FC = () => {
  const {
    tareas,
    cargando,
    error,
    nuevaTarea,
    setNuevaTarea,
    agregarTarea,
    toggleTarea,
    eliminarTarea,
  } = useTareas();

  const pendientes = tareas.filter(t => !t.completada).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Tareas ({pendientes} pendientes)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Campo para nueva tarea */}
        <IonItem>
          <IonInput
            value={nuevaTarea}
            placeholder="Nueva tarea..."
            onIonInput={(e) => setNuevaTarea(e.detail.value ?? '')}
            onKeyUp={(e) => e.key === 'Enter' && agregarTarea()}
          />
          <IonButton slot="end" onClick={agregarTarea} aria-label="Agregar tarea">
            <IonIcon icon={addOutline} />
          </IonButton>
        </IonItem>

        {/* Estado de carga */}
        {cargando && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <IonText color="danger">
            <p className="ion-padding">{error}</p>
          </IonText>
        )}

        {/* Lista de tareas */}
        {!cargando && !error && (
          <>
            <IonList className="ion-margin-top">
              {tareas.map((tarea) => (
                <IonItem
                  key={tarea.id}
                  style={{ opacity: tarea.completada ? 0.5 : 1 }}
                >
                  <IonCheckbox
                    slot="start"
                    checked={tarea.completada}
                    onIonChange={() => toggleTarea(tarea.id)}
                    aria-label={`Marcar "${tarea.texto}" como ${tarea.completada ? 'pendiente' : 'completada'}`}
                  />
                  <IonLabel
                    style={{
                      textDecoration: tarea.completada ? 'line-through' : 'none',
                    }}
                  >
                    {tarea.texto}
                  </IonLabel>
                  <IonButton
                    slot="end"
                    fill="clear"
                    color="danger"
                    onClick={() => eliminarTarea(tarea.id)}
                    aria-label={`Eliminar "${tarea.texto}"`}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>

            {tareas.length === 0 && (
              <p
                className="ion-text-center ion-padding"
                style={{ color: '#888' }}
              >
                No hay tareas. ¡Agrega una arriba!
              </p>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tareas;
