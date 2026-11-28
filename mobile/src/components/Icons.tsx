import React from "react";
import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function SvgIcon({
  size = 18,
  color = "#2B141A",
  strokeWidth = 1.65,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

/** Signature turmeric beacon/flame mark for Hidden Gem Scores */
export function ScoreFlameIcon({ size = 14, color = "#D9A12B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.3 2.6c.4 3.1-1.9 5-1.9 7.6 0 1.4 1 2.5 2.2 2.5 1.4 0 2.3-1.2 2.1-3.1 2.2 1.7 3.8 4.4 3.8 7.1A6.5 6.5 0 0 1 5.5 16.5c0-4.2 3.1-7.8 6.8-13.9Z"
        fill={color}
      />
    </Svg>
  );
}

export function Compass(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Polygon points="15.5,8.5 13.7,13.7 8.5,15.5 10.3,10.3 15.5,8.5" />
    </SvgIcon>
  );
}

export function PlusCircle(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 8v8M8 12h8" />
    </SvgIcon>
  );
}

export function BookmarkCheck(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z" />
      <Path d="m9.5 10.5 1.8 1.8 3.4-3.6" />
    </SvgIcon>
  );
}

export function BookmarkPlus(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z" />
      <Path d="M12 7.5v5M9.5 10h5" />
    </SvgIcon>
  );
}

export function User(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={8.5} r={3.5} />
      <Path d="M5.5 19.5c1.3-3 3.7-4.5 6.5-4.5s5.2 1.5 6.5 4.5" />
    </SvgIcon>
  );
}

export function UserCheck(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={10} cy={8.5} r={3.5} />
      <Path d="M4 19.5c1.1-2.8 3.2-4.2 6-4.2 1.5 0 2.9.4 4 1.2" />
      <Path d="m15.5 14 2 2 3.5-3.5" />
    </SvgIcon>
  );
}

export function BarChart3(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 19.5h16" />
      <Path d="M7.5 16v-4.5M12 16V7M16.5 16v-7" />
    </SvgIcon>
  );
}

export function Layers(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="m12 4 8 4.2-8 4.2-8-4.2L12 4Z" />
      <Path d="m4 12.2 8 4.2 8-4.2" />
      <Path d="m4 16.2 8 4.2 8-4.2" />
    </SvgIcon>
  );
}

export function Search(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={10.5} cy={10.5} r={6.5} />
      <Path d="m15.5 15.5 4.5 4.5" />
    </SvgIcon>
  );
}

export function XIcon(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </SvgIcon>
  );
}

export function ArrowRight(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
    </SvgIcon>
  );
}

export function ArrowLeft(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M19 12H5M10.5 6.5 5 12l5.5 5.5" />
    </SvgIcon>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="m9.5 6.5 5.5 5.5-5.5 5.5" />
    </SvgIcon>
  );
}

export function Check(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="m5 12.5 4.5 4.5L19 7.5" />
    </SvgIcon>
  );
}

export function CheckCircle2(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m8.5 12.3 2.3 2.3 4.8-4.8" />
    </SvgIcon>
  );
}

export function AlertTriangle(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M10.4 4.4 3.1 17.3A1.8 1.8 0 0 0 4.7 20h14.6a1.8 1.8 0 0 0 1.6-2.7L13.6 4.4a1.8 1.8 0 0 0-3.2 0Z" />
      <Path d="M12 9.5v4.2M12 16.8h.01" />
    </SvgIcon>
  );
}

export function Info(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11.2v5.3M12 7.8h.01" />
    </SvgIcon>
  );
}

export function HandHeart(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 20s-6.5-4.2-8.2-8.1C2.6 9.1 4.4 6 7.5 6c1.8 0 3.4 1 4.5 2.5C13.1 7 14.7 6 16.5 6c3.1 0 4.9 3.1 3.7 5.9C18.5 15.8 12 20 12 20Z" />
    </SvgIcon>
  );
}

export function LayoutGrid(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={4} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={4} width={6.5} height={6.5} rx={1.5} />
      <Rect x={4} y={13.5} width={6.5} height={6.5} rx={1.5} />
      <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={1.5} />
    </SvgIcon>
  );
}

export function MapIcon(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5V6.5Z" />
      <Path d="M9 4v13.5M15 6.5V20" />
    </SvgIcon>
  );
}

export function MapPin(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 21s6-5.2 6-10.5a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z" />
      <Circle cx={12} cy={10.5} r={2.2} />
    </SvgIcon>
  );
}

export function Shield(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 3.5 19 6.2v5.4c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.2l7-2.7Z" />
    </SvgIcon>
  );
}

export function ShieldCheck(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 3.5 19 6.2v5.4c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.2l7-2.7Z" />
      <Path d="m9.2 12 2 2 3.8-4" />
    </SvgIcon>
  );
}

export function ShieldAlert(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 3.5 19 6.2v5.4c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.2l7-2.7Z" />
      <Path d="M12 8.5v4M12 15.5h.01" />
    </SvgIcon>
  );
}

export function Award(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx={12} cy={9} r={5} />
      <Path d="M9.5 13.5 8.5 20l3.5-1.8 3.5 1.8-1-6.5" />
    </SvgIcon>
  );
}

export function Trophy(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <Path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5v1A3 3 0 0 0 6 11.5h1M17 6h2.5A1.5 1.5 0 0 1 21 7.5v1a3 3 0 0 1-3 3h-1" />
      <Path d="M12 14v5M8.5 19.5h7" />
    </SvgIcon>
  );
}

export function Lock(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={5} y={10.5} width={14} height={9.5} rx={2} />
      <Path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </SvgIcon>
  );
}

export function Store(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 9.5 5.5 4.5h13L20 9.5" />
      <Path d="M4 9.5a2.5 2.5 0 0 0 4 2 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4-2" />
      <Path d="M5.5 12.2v7.3h13v-7.3" />
    </SvgIcon>
  );
}

export function Mail(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2} />
      <Path d="m4.5 7 7.5 5.5L19.5 7" />
    </SvgIcon>
  );
}

export function LogOut(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M14.5 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7.5" />
      <Path d="M10.5 12h9.5M16.5 8.5 20 12l-3.5 3.5" />
    </SvgIcon>
  );
}

export function Bus(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={5} y={4} width={14} height={14} rx={2.5} />
      <Path d="M5 12.5h14M8.5 18v2M15.5 18v2M8.5 15h.01M15.5 15h.01" />
    </SvgIcon>
  );
}

export function Utensils(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6.5 3.5v7M9.5 3.5v7M6.5 7.5h3M8 10.5V20" />
      <Path d="M15.5 3.5c1.8 0 2.5 2 2.5 5s-.7 4-2.5 4V20" />
    </SvgIcon>
  );
}

export function Landmark(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 9.5 12 4l8 5.5H4Z" />
      <Path d="M6.5 9.5v8M10 9.5v8M14 9.5v8M17.5 9.5v8M3.5 19.5h17" />
    </SvgIcon>
  );
}

export function Printer(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M7 8.5V4.5h10v4" />
      <Rect x={4} y={8.5} width={16} height={8} rx={2} />
      <Path d="M7 14h10v5.5H7V14Z" />
    </SvgIcon>
  );
}

export function Trash2(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4.5 6.5h15M9.5 6.5V4.5h5v2" />
      <Path d="M7 6.5v13a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-13" />
    </SvgIcon>
  );
}

export function WifiOff(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 4 20 20" />
      <Path d="M8.8 14.8a5 5 0 0 1 6.4 0M5.5 11.3a9.5 9.5 0 0 1 6.5-2.6M12 18h.01" />
    </SvgIcon>
  );
}

export function Flag(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M5.5 20V4.5" />
      <Path d="M5.5 4.5h11l-2 4.2 2 4.3h-11" />
    </SvgIcon>
  );
}

export function Navigation(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Polygon points="3.5,11.5 20.5,3.5 12.5,20.5 10.5,13.5 3.5,11.5" />
    </SvgIcon>
  );
}

export function Phone(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
    </SvgIcon>
  );
}

export function MessageCircle(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M5 17.5 3.5 20.5 7 19.2A8.5 8.5 0 1 0 5 17.5Z" />
    </SvgIcon>
  );
}

export function UploadCloud(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M7.5 17.5h-1A4 4 0 0 1 6 9.6a5.5 5.5 0 0 1 10.6-1.2 3.8 3.8 0 0 1 1 7.4" />
      <Path d="M12 12v8M9 14.5l3-3 3 3" />
    </SvgIcon>
  );
}

export function FileCheck2(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Z" />
      <Path d="m9.5 14 1.8 1.8 3.4-3.6" />
    </SvgIcon>
  );
}

export function Film(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={3.5} y={5} width={17} height={14} rx={2} />
      <Path d="M7.5 5v14M16.5 5v14M3.5 9.5h4M3.5 14.5h4M16.5 9.5h4M16.5 14.5h4" />
    </SvgIcon>
  );
}

export function PlayIcon({ size = 14, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="7,5 19,12 7,19 7,5" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 14, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6.5} y={5} width={3.5} height={14} rx={0.8} fill={color} />
      <Rect x={14} y={5} width={3.5} height={14} rx={0.8} fill={color} />
    </Svg>
  );
}

export function Volume2(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Polygon points="5,9.5 9.5,9.5 14,5.5 14,18.5 9.5,14.5 5,14.5 5,9.5" />
      <Path d="M17.2 8.8a4.5 4.5 0 0 1 0 6.4M19.5 6.5a8 8 0 0 1 0 11" />
    </SvgIcon>
  );
}

export function VolumeX(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Polygon points="5,9.5 9.5,9.5 14,5.5 14,18.5 9.5,14.5 5,14.5 5,9.5" />
      <Path d="m17 9.5 4 5M21 9.5l-4 5" />
    </SvgIcon>
  );
}

export function Youtube(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={3} y={6} width={18} height={12} rx={3.5} />
      <Polygon points="10.2,9.2 15.5,12 10.2,14.8 10.2,9.2" fill={p.color || "#FFFFFF"} stroke="none" />
    </SvgIcon>
  );
}

export function QrCodeIcon(p: IconProps) {
  return (
    <SvgIcon {...p}>
      <Rect x={4} y={4} width={6} height={6} rx={1} />
      <Rect x={14} y={4} width={6} height={6} rx={1} />
      <Rect x={4} y={14} width={6} height={6} rx={1} />
      <Path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
    </SvgIcon>
  );
}
