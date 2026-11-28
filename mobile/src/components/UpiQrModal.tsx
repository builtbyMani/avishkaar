import React, { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { formatUpiHandle } from "../lib/domain";
import { AnimatedCenterModal, TactilePressable, triggerHaptic } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";
import type { LocalVendor } from "../types/domain";
import { Navigation, XIcon } from "./Icons";

function buildMatrixCells(seed: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const border = r === 0 || r === 4 || c === 0 || c === 4;
        const center = r === 2 && c === 2;
        grid[r0 + r][c0 + c] = border || center;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 5);
  drawFinder(size - 5, 0);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 6 && c < 6) || (r < 6 && c >= size - 6) || (r >= size - 6 && c < 6);
      if (inFinder) continue;
      h ^= r * 31 + c * 17;
      h = Math.imul(h, 16777619);
      grid[r][c] = (h & 3) !== 0;
    }
  }
  return grid;
}

export function UpiQrModal({
  vendor,
  onClose,
}: {
  vendor: LocalVendor | null;
  onClose: () => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setNotice(null);
  }, [vendor]);

  const upiId = vendor ? formatUpiHandle(vendor.name, vendor.upiId) : "";
  const upiUri = vendor
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(vendor.name)}&cu=INR`
    : "";
  const matrix = upiId ? buildMatrixCells(upiId) : [];
  const cellSize = 10;

  async function handleOpenUpi() {
    if (!upiUri) return;
    triggerHaptic("medium");
    try {
      const supported = await Linking.canOpenURL(upiUri);
      if (!supported) {
        setNotice("No UPI app detected on this device — long-press the UPI ID above to copy.");
        return;
      }
      await Linking.openURL(upiUri);
    } catch {
      setNotice("Could not open UPI app — copy the UPI ID above to pay directly.");
    }
  }

  return (
    <AnimatedCenterModal open={Boolean(vendor)} onClose={onClose} cardStyle={styles.card}>
      {vendor && (
        <>
          <View style={styles.topRow}>
            <View style={styles.zeroBadge}>
              <Text style={styles.zeroBadgeText}>0% Platform Commission</Text>
            </View>
            <TactilePressable onPress={onClose} style={styles.closeBtn}>
              <XIcon size={16} color={COLORS.muted} />
            </TactilePressable>
          </View>

          <Text style={styles.title}>{vendor.name}</Text>
          <Text style={styles.sub}>{vendor.specialty}</Text>

          <View style={styles.qrFrame}>
            <Svg width={matrix.length * cellSize} height={matrix.length * cellSize}>
              {matrix.map((row, r) =>
                row.map((filled, c) =>
                  filled ? (
                    <Rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      rx={1.5}
                      fill={COLORS.ink}
                    />
                  ) : null,
                ),
              )}
            </Svg>
          </View>

          <Text selectable style={styles.upiHandle}>
            {upiId}
          </Text>
          <Text style={styles.hint}>
            100% goes directly to the artisan/host via UPI — zero intermediary fees.
          </Text>

          {notice && <Text style={styles.noticeText}>{notice}</Text>}

          <TactilePressable onPress={() => void handleOpenUpi()} style={styles.payBtn}>
            <Navigation size={14} color={COLORS.parchment} />
            <Text style={styles.payBtnText}>Open UPI Payment App</Text>
          </TactilePressable>
        </>
      )}
    </AnimatedCenterModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.parchment,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: "center",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  zeroBadge: {
    borderRadius: 999,
    backgroundColor: COLORS.emeraldTint,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zeroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emeraldDark,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 99,
    backgroundColor: COLORS.well,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.rozha,
    fontSize: 22,
    color: COLORS.ink,
    textAlign: "center",
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
  },
  qrFrame: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upiHandle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.wine,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
  },
  noticeText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.brick,
    textAlign: "center",
  },
  payBtn: {
    marginTop: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingVertical: 12,
  },
  payBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.parchment,
  },
});
