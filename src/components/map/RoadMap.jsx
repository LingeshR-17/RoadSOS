import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import HospitalMarker from './HospitalMarker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function RoadMap({
  userLocation,
  hospital,
  route,
  bystanders = [],
  blackspots = [],
  showHospitals = true,
  showBystanders = false,
  showBlackspots = false,
}) {
  const initialRegion = {
    latitude: userLocation.latitude || 9.9252,
    longitude: userLocation.longitude || 78.1198,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={initialRegion}
      zoomEnabled={true}
      scrollEnabled={true}
      pitchEnabled={true}
      rotateEnabled={true}
      showsUserLocation={false} // Custom marker handles this with a better visual pulse
      showsMyLocationButton={true}
    >
      {/* User Location Marker */}
      <Marker
        coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
        title="My Location"
        zIndex={10}
      >
        <View style={styles.userMarkerContainer}>
          <View style={styles.userMarkerOuter}>
            <View style={styles.userMarkerInner} />
          </View>
        </View>
      </Marker>

      {/* Hospital Markers */}
      {showHospitals && hospital && (
        <Marker
          coordinate={{ latitude: hospital.latitude, longitude: hospital.longitude }}
          title={hospital.name}
          description={hospital.address}
          zIndex={5}
        >
          <HospitalMarker />
        </Marker>
      )}

      {/* Bystander Markers */}
      {showBystanders && bystanders.map((bystander) => (
        <Marker
          key={bystander.id}
          coordinate={{ latitude: bystander.latitude, longitude: bystander.longitude }}
          title={bystander.name}
          description={bystander.role}
          zIndex={4}
        >
          <View style={styles.bystanderMarkerContainer}>
            <View style={styles.bystanderOuter}>
              <View style={styles.bystanderInner}>
                <Ionicons name="people" size={12} color={COLORS.card} />
              </View>
            </View>
          </View>
        </Marker>
      ))}

      {/* Blackspot Warnings */}
      {showBlackspots && blackspots.map((blackspot) => (
        <Marker
          key={blackspot.id}
          coordinate={{ latitude: blackspot.latitude, longitude: blackspot.longitude }}
          title={blackspot.name}
          description={blackspot.description}
          zIndex={3}
        >
          <View style={styles.blackspotMarkerContainer}>
            <View style={styles.blackspotOuter}>
              <Ionicons name="warning" size={12} color={COLORS.card} />
            </View>
          </View>
        </Marker>
      ))}

      {/* Route Line */}
      {showHospitals && route && route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor={COLORS.secondary}
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.secondary}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  bystanderMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bystanderOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bystanderInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  blackspotMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackspotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
});
