// ─────────────────────────────────────────────────────────────────────────────
// SCREEN — New Member
// Formulario para agregar un nuevo integrante familiar.
// Calcula los números localmente al guardar (con @jyotish/numerology).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, StatusBar, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground } from '../../../src/components/CosmicBackground';
import { NumerologyMap } from '../../../src/components/NumerologyMap';
import { useMembers } from '../../../src/hooks/useMembers';
import { calculateMap } from '@jyotish/numerology';
import {
  COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOWS,
} from '../../../src/constants/design';
import type { MemberNumbers } from '../../../src/stores/app.store';

const RELATIONS = [
  { value: 'yo',      label: 'Yo'       },
  { value: 'pareja',  label: 'Pareja'   },
  { value: 'hijo',    label: 'Hijo'     },
  { value: 'hija',    label: 'Hija'     },
  { value: 'madre',   label: 'Madre'    },
  { value: 'padre',   label: 'Padre'    },
  { value: 'hermano', label: 'Hermano'  },
  { value: 'hermana', label: 'Hermana'  },
  { value: 'amigo',   label: 'Amigo/a'  },
  { value: 'otro',    label: 'Otro'     },
];

interface FormState {
  firstName:       string;
  paternalSurname: string;
  maternalSurname: string;
  birthDay:        string;
  birthMonth:      string;
  birthYear:       string;
  relation:        string;
}

const INITIAL: FormState = {
  firstName: '', paternalSurname: '', maternalSurname: '',
  birthDay: '', birthMonth: '', birthYear: '',
  relation: 'pareja',
};

// Preview del mapa en tiempo real
function usePreviewMap(form: FormState): MemberNumbers | null {
  const { firstName, paternalSurname, maternalSurname, birthDay, birthMonth, birthYear } = form;
  if (!firstName || !paternalSurname || !birthDay || !birthMonth || !birthYear) return null;
  const day   = parseInt(birthDay,  10);
  const month = parseInt(birthMonth,10);
  const year  = parseInt(birthYear, 10);
  if (!day || !month || !year || year < 1900 || year > 2100) return null;
  try {
    return calculateMap({ firstName, paternalSurname, maternalSurname, birthDate: { day, month, year } });
  } catch { return null; }
}

export default function NewMemberScreen() {
  const { addMember } = useMembers();
  const [form,    setForm]    = useState<FormState>(INITIAL);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const preview = usePreviewMap(form);

  function setField(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.firstName.trim())       errs.firstName       = 'Requerido';
    if (!form.paternalSurname.trim()) errs.paternalSurname = 'Requerido';
    const day   = parseInt(form.birthDay,   10);
    const month = parseInt(form.birthMonth, 10);
    const year  = parseInt(form.birthYear,  10);
    if (!day   || day   < 1  || day   > 31)  errs.birthDay   = 'Día inválido (1–31)';
    if (!month || month < 1  || month > 12)  errs.birthMonth = 'Mes inválido (1–12)';
    if (!year  || year  < 1900 || year > 2100) errs.birthYear= 'Año inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    const day   = parseInt(form.birthDay,   10);
    const month = parseInt(form.birthMonth, 10);
    const year  = parseInt(form.birthYear,  10);

    // Calcular números
    let numbers: MemberNumbers | null = null;
    try {
      numbers = calculateMap({
        firstName:       form.firstName.trim(),
        paternalSurname: form.paternalSurname.trim(),
        maternalSurname: form.maternalSurname.trim(),
        birthDate: { day, month, year },
      });
    } catch { /* guardar sin números — se recalculan en member detail */ }

    try {
      await addMember({
        firstName:       form.firstName.trim(),
        paternalSurname: form.paternalSurname.trim(),
        maternalSurname: form.maternalSurname.trim(),
        birthDay:  day, birthMonth: month, birthYear: year,
        relation:  form.relation,
        numbers,
      });

      setSaved(true);
      setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setErrors({ firstName: msg });
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <CosmicBackground>
        <View style={styles.savedContainer}>
          <Text style={styles.savedIcon}>✦</Text>
          <Text style={styles.savedTitle}>¡Integrante agregado!</Text>
          <Text style={styles.savedSub}>Su mapa ha sido calculado.</Text>
        </View>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
              <Text style={styles.navBack}>‹ Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nuevo Integrante</Text>
            <View style={{ width: 70 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Nombre */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Nombre completo</Text>
              <Field
                placeholder="Nombre(s)"
                value={form.firstName}
                onChangeText={v => setField('firstName', v)}
                error={errors.firstName}
                autoCapitalize="words"
              />
              <Field
                placeholder="Apellido paterno"
                value={form.paternalSurname}
                onChangeText={v => setField('paternalSurname', v)}
                error={errors.paternalSurname}
                autoCapitalize="words"
              />
              <Field
                placeholder="Apellido materno (opcional)"
                value={form.maternalSurname}
                onChangeText={v => setField('maternalSurname', v)}
                autoCapitalize="words"
              />
            </View>

            {/* Fecha de nacimiento */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fecha de nacimiento</Text>
              <View style={styles.dateRow}>
                <Field
                  placeholder="Día"
                  value={form.birthDay}
                  onChangeText={v => setField('birthDay', v)}
                  error={errors.birthDay}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={{ flex: 1 }}
                />
                <Field
                  placeholder="Mes"
                  value={form.birthMonth}
                  onChangeText={v => setField('birthMonth', v)}
                  error={errors.birthMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={{ flex: 1 }}
                />
                <Field
                  placeholder="Año"
                  value={form.birthYear}
                  onChangeText={v => setField('birthYear', v)}
                  error={errors.birthYear}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={{ flex: 1.5 }}
                />
              </View>
              <Text style={styles.dateHint}>Ejemplo: 15 / 3 / 1990</Text>
            </View>

            {/* Relación */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Relación</Text>
              <View style={styles.relationsGrid}>
                {RELATIONS.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.relationChip,
                      form.relation === r.value && styles.relationChipActive,
                    ]}
                    onPress={() => setField('relation', r.value)}
                  >
                    <Text style={[
                      styles.relationChipText,
                      form.relation === r.value && styles.relationChipTextActive,
                    ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview del mapa */}
            {preview && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Vista previa del mapa</Text>
                <NumerologyMap numbers={preview} compact />
              </View>
            )}

            {/* Guardar */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving
                ? <ActivityIndicator color={COLORS.textInverse} size="small" />
                : <Text style={styles.saveBtnText}>Guardar integrante</Text>
              }
            </TouchableOpacity>

            <View style={{ height: SPACING.xxxl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({
  placeholder, value, onChangeText, error,
  keyboardType, maxLength, autoCapitalize, style,
}: {
  placeholder: string; value: string;
  onChangeText: (v: string) => void;
  error?: string; keyboardType?: any;
  maxLength?: number; autoCapitalize?: any;
  style?: object;
}) {
  return (
    <View style={[{ gap: 4 }, style]}>
      <TextInput
        style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
      />
      {error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.bgSection,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.bodyRegular,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  inputError: { borderColor: COLORS.error + '80' },
  error: { fontFamily: FONTS.body, fontSize: FONT_SIZE.xs, color: COLORS.error, paddingLeft: 4 },
});

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBack: { fontFamily: FONTS.body, fontSize: FONT_SIZE.base, color: COLORS.gold },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  content: { padding: SPACING.xl, gap: SPACING.xxl },
  section: { gap: SPACING.md },
  sectionLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  dateRow: { flexDirection: 'row', gap: SPACING.sm },
  dateHint: { fontFamily: FONTS.body, fontSize: FONT_SIZE.xs, color: COLORS.textMuted, paddingLeft: 4 },
  relationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  relationChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  relationChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim + '30' },
  relationChipText: { fontFamily: FONTS.body, fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  relationChipTextActive: { color: COLORS.goldLight },
  // ── Preview
  previewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  previewTitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZE.xs,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: COLORS.gold,
    textAlign: 'center',
  },
  // ── Save
  saveBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.gold,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.textInverse,
    letterSpacing: 1.5,
  },
  // ── Saved
  savedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  savedIcon: { fontSize: 64, color: COLORS.gold },
  savedTitle: { fontFamily: FONTS.display, fontSize: FONT_SIZE.xl, color: COLORS.goldLight, letterSpacing: 2 },
  savedSub: { fontFamily: FONTS.body, fontSize: FONT_SIZE.base, color: COLORS.textSecondary },
});
