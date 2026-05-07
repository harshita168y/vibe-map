// type VibePinProps = {
//   emoji: string;
//   title: string;
//   vibes: number;
//   selected?: boolean;
// };

// export function VibePin({
//   emoji,
//   title,
//   vibes,
//   selected,
// }: VibePinProps) {
//   return (
//     <div
//       className={`relative transition-all duration-300 ${
//         selected ? "scale-110" : "scale-100"
//       }`}
//     >
//       <div
//         className={`absolute inset-0 rounded-full ${
//           selected ? "animate-ping bg-pink-300/50" : ""
//         }`}
//       />

//       <div className="relative flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl">
//         <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-xl">
//           {emoji}
//         </span>

//         <div>
//           <p className="text-sm font-bold">{title}</p>
//           <p className="text-xs text-zinc-400">
//             {vibes} vibes
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }