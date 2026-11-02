import { BotProfile, Opening, Puzzle } from "./types";

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 400, name: "Pawn Pusher", title: "400", avatar: "♟", color: "#a98a70",
    bio: "Still learning which pieces belong in the centre. Expect surprises.", style: "Chaotic learner",
    repertoire: ["e4", "d4"], skill: 1, blunderRate: .34, traits: ["Pawn storms", "Avoids trades", "Random surprises"],
  },
  {
    id: 800, name: "Club Rookie", title: "800", avatar: "♞", color: "#c09157",
    bio: "Loves a simple capture, but watch the back rank and loose pieces.", style: "Tactical beginner",
    repertoire: ["Italian Game", "Scotch Game"], skill: 5, blunderRate: .21, traits: ["Simple captures", "Pin-vulnerable", "Back-rank lapses"],
  },
  {
    id: 1200, name: "Casual Knight", title: "1200", avatar: "♘", color: "#71a3bb",
    bio: "Develops quickly and attacks directly. Sometimes calculates one move too few.", style: "Direct attacker",
    repertoire: ["Italian Game", "Sicilian Defense"], skill: 9, blunderRate: .13, traits: ["Quick development", "King attacks", "Tactical slips"],
  },
  {
    id: 1600, name: "Tactical Bishop", title: "1600", avatar: "♗", color: "#c986aa",
    bio: "An aggressive tactician who is happy to sacrifice for open lines and initiative.", style: "Aggressive attacker",
    repertoire: ["King's Gambit", "Sicilian Najdorf", "Evans Gambit"], skill: 13, blunderRate: .08, traits: ["Checks first", "Open files", "Gambit player"],
  },
  {
    id: 2000, name: "Strong Master", title: "2000", avatar: "♜", color: "#a8c479",
    bio: "Patient and practical. Weak pawn structures become endgame targets.", style: "Positional grind",
    repertoire: ["Caro-Kann", "Queen's Gambit", "Berlin"], skill: 17, blunderRate: .035, traits: ["Structure expert", "Endgame technique", "Patient"],
  },
  {
    id: 2400, name: "Grandmaster X", title: "2400", avatar: "♛", color: "#b6f36b",
    bio: "Near-optimal calculation with a deep opening file and no free blunders.", style: "Elite calculator",
    repertoire: ["Queen's Gambit", "Grünfeld", "Najdorf"], skill: 20, blunderRate: .008, traits: ["Deep calculation", "Zero blunders", "Universal repertoire"],
  },
];

export const OPENINGS: Opening[] = [
  { name: "Ruy Lopez", eco: "C60", moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5", category: "Open game", score: "+0.25", concept: "Pressure the e5 knight and prepare to build a durable centre.", tags: ["Pin", "Centre", "Spanish"] },
  { name: "Italian Game", eco: "C50", moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4", category: "Open game", score: "+0.20", concept: "Develop with tempo, castle quickly, and aim at f7.", tags: ["Development", "f7", "Classical"] },
  { name: "Scotch Game", eco: "C45", moves: "1. e4 e5 2. Nf3 Nc6 3. d4", category: "Open game", score: "+0.18", concept: "Open the centre before Black can build a comfortable structure.", tags: ["Open centre", "Initiative", "Active"] },
  { name: "King's Gambit", eco: "C30", moves: "1. e4 e5 2. f4", category: "Open game", score: "+0.10", concept: "Offer a pawn to drag the e5 pawn away and seize the initiative.", tags: ["Gambit", "Attack", "Sharp"] },
  { name: "Sicilian Defense", eco: "B20", moves: "1. e4 c5", category: "Semi-open", score: "−0.05", concept: "Trade symmetry for dynamic counterplay and pressure on d4.", tags: ["Counterplay", "Asymmetry", "Dynamic"] },
  { name: "Sicilian Najdorf", eco: "B90", moves: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", category: "Semi-open", score: "−0.12", concept: "The most ambitious Sicilian: flexible, concrete, and rich in tactics.", tags: ["Najdorf", "Theory", "Tactical"] },
  { name: "Caro-Kann Defense", eco: "B10", moves: "1. e4 c6 2. d4 d5", category: "Semi-open", score: "−0.02", concept: "Challenge the centre with a sound pawn chain and active light bishop.", tags: ["Solid", "Structure", "Endgame"] },
  { name: "French Defense", eco: "C00", moves: "1. e4 e6 2. d4 d5", category: "Semi-open", score: "−0.04", concept: "Invite White to overextend, then strike the centre with c5 and f6.", tags: ["Counterattack", "Pawn chain", "Strategic"] },
  { name: "Scandinavian Defense", eco: "B01", moves: "1. e4 d5", category: "Semi-open", score: "−0.10", concept: "Challenge e4 immediately and accept a tempo loss for a clear plan.", tags: ["Direct", "Queen", "Practical"] },
  { name: "Queen's Gambit", eco: "D06", moves: "1. d4 d5 2. c4", category: "Closed game", score: "+0.22", concept: "Offer the c-pawn to build lasting central space and pressure.", tags: ["Space", "Centre", "Classical"] },
  { name: "London System", eco: "D02", moves: "1. d4 d5 2. Nf3 Nf6 3. Bf4", category: "Closed game", score: "+0.12", concept: "A reliable setup: develop the dark bishop outside the pawn chain.", tags: ["System", "Solid", "Low theory"] },
  { name: "King's Indian Defense", eco: "E60", moves: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", category: "Indian", score: "+0.08", concept: "Give White space, then attack the centre with ...e5 or ...c5.", tags: ["Fianchetto", "Counterplay", "Kingside"] },
  { name: "Nimzo-Indian Defense", eco: "E20", moves: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", category: "Indian", score: "−0.01", concept: "Use the pin and bishop pair trade to create structural targets.", tags: ["Pin", "Structure", "Flexible"] },
  { name: "Grünfeld Defense", eco: "D80", moves: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", category: "Indian", score: "−0.08", concept: "Allow a big centre and undermine it with immediate piece pressure.", tags: ["Dynamic", "Centre", "Tactical"] },
  { name: "English Opening", eco: "A10", moves: "1. c4", category: "Flank opening", score: "+0.14", concept: "Control d5 from the flank and transpose into a flexible position.", tags: ["Flank", "Flexible", "Positional"] },
  { name: "Catalan Opening", eco: "E06", moves: "1. d4 Nf6 2. c4 e6 3. g3", category: "Flank opening", score: "+0.30", concept: "Long-range pressure on the queenside with a fianchettoed bishop.", tags: ["Fianchetto", "Pressure", "Modern"] },
  { name: "Vienna Game", eco: "C25", moves: "1. e4 e5 2. Nc3", category: "Open game", score: "+0.16", concept: "Keep the option of f4 while developing the queen knight naturally.", tags: ["Flexible", "Attack", "Development"] },
  { name: "Pirc Defense", eco: "B07", moves: "1. e4 d6 2. d4 Nf6 3. Nc3 g6", category: "Hypermodern", score: "−0.06", concept: "Let White claim space, then undermine it with piece pressure.", tags: ["Hypermodern", "Fianchetto", "Counterplay"] },
  { name: "Dutch Defense", eco: "A80", moves: "1. d4 f5", category: "Flank opening", score: "−0.14", concept: "Fight for e4 from move one and launch a kingside initiative.", tags: ["Aggressive", "Kingside", "Unbalanced"] },
];

export const PUZZLES: Puzzle[] = [
  { id: 1, title: "The quiet fork", theme: "Forks", rating: 1120, difficulty: "Warm-up", fen: "r1b1r1k1/ppp2ppp/2n5/8/2B1P3/2P2N2/PP3PPP/R1B1R1K1 w - - 0 1", solution: "Bxf7+", hint: "Look for a forcing check that attacks the queen and king." },
  { id: 2, title: "Pin the defender", theme: "Pins", rating: 1280, difficulty: "Intermediate", fen: "r3k2r/ppp2ppp/2n2n2/3qp3/3P4/2P1PN2/PP3PPP/R1BQ1RK1 w kq - 0 1", solution: "dxe5", hint: "The knight on f6 is doing two jobs. Remove its support." },
  { id: 3, title: "Open the file", theme: "Discovered attacks", rating: 1460, difficulty: "Intermediate", fen: "2r3k1/pp3ppp/2p5/3p4/3P1B2/2P3P1/PP3P1P/2R3K1 w - - 0 1", solution: "Bc7", hint: "Reposition the bishop to the active diagonal and keep pressure on the queenside." },
  { id: 4, title: "Back rank postcard", theme: "Back-rank mates", rating: 1560, difficulty: "Advanced", fen: "6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1", solution: "Qxf7+", hint: "The king is boxed in by its own pawns. Start with the forcing check." },
  { id: 5, title: "Deflect the guard", theme: "Deflections", rating: 1720, difficulty: "Advanced", fen: "6k1/5ppp/8/8/8/2Q5/5PPP/6K1 w - - 0 1", solution: "Qc8+", hint: "Drive the king to the square where your queen owns the rank." },
];

export const MIDDLEGAME_LESSONS = [
  { title: "Pawn structures", subtitle: "Make the pawns tell you the plan", icon: "♟", progress: 72, detail: "Isolated, doubled, backward and passed pawns each change which files and squares matter." },
  { title: "Piece placement", subtitle: "Outposts, open files & bishop pairs", icon: "♞", progress: 41, detail: "Improve your worst piece, occupy weak squares, and make exchanges that preserve your advantage." },
  { title: "Attacking the king", subtitle: "Build a safe, forcing attack", icon: "♛", progress: 28, detail: "Bring pieces before pawns, remove defenders, and calculate forcing moves in the right order." },
  { title: "Prophylaxis", subtitle: "See your opponent's idea first", icon: "◈", progress: 15, detail: "Ask what your opponent would play next, then make a useful move that takes it away." },
];
