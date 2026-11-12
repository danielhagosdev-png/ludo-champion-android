import React, { useState } from 'react';
import { X, Dices, Shield, Swords, Flag, Sparkles, Lightbulb, Lock, Trophy, Users, ShieldCheck } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | '2player' | 'teams' | 'strategy'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sheet-backdrop">
      <div className="w-full max-w-lg sheet p-4 sm:p-6 text-ivory flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-felt-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ivory/15 border border-ivory/30 text-ivory">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ivory">How to play</h2>
              <p className="text-xs text-mist">Classic, 2-Player, and Team Up (2v2) Modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-mist hover:text-ivory hover:bg-felt-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-felt-700/80 rounded-xl my-3 shrink-0 text-center">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-1.5 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'rules'
                ? 'bg-ivory text-felt-950 shadow'
                : 'text-mist hover:text-ivory'
            }`}
          >
            Core Rules
          </button>
          <button
            onClick={() => setActiveTab('2player')}
            className={`py-1.5 text-[11px] font-semibold rounded-lg transition ${
              activeTab === '2player'
                ? 'bg-ivory text-felt-950 shadow'
                : 'text-mist hover:text-ivory'
            }`}
          >
            2-Player 1v1
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-1.5 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'teams'
                ? 'bg-ivory text-felt-950 shadow'
                : 'text-mist hover:text-ivory'
            }`}
          >
            Team Up 2v2
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-1.5 text-[11px] font-semibold rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'strategy'
                ? 'bg-ivory text-felt-950 shadow'
                : 'text-mist hover:text-ivory'
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>Tricks</span>
          </button>
        </div>

        {/* Tab 1: Official Core Rules */}
        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm text-mist">
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Trophy className="w-4 h-4 text-ivory" />
                <span>Aim &amp; Full Rankings</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                Be the first to move all 4 tokens from your starting base, clockwise around the board, and into the center home triangle. <strong>The match continues after 1st player finishes</strong> so all rankings (1st, 2nd, 3rd, and 4th place) are decided!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Dices className="w-4 h-4 text-jade" />
                <span>Starting a Token</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                You must roll a <strong className="text-ivory">6</strong> to move a token out of your base onto the starting square of your color.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Flag className="w-4 h-4 text-sapphire" />
                <span>Extra Turns</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-mist text-xs">
                <li>Rolling a <strong>6</strong> gives you another roll.</li>
                <li><strong>Capturing (killing)</strong> an opponent’s token gives you another roll.</li>
                <li>Getting a token all the way into the <strong>center home</strong> also gives an extra roll!</li>
              </ul>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1 text-ruby">
                <Dices className="w-4 h-4" />
                <span>Three Sixes Rule</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                If you roll three consecutive 6s in the same turn, <strong>the third 6 is cancelled</strong> and your turn immediately ends. The moves from the first two 6s still count.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Swords className="w-4 h-4 text-ruby" />
                <span>Capturing &amp; Safe Stars</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                Landing on an opponent’s single token sends it back to base (must roll 6 again). You get an extra roll. <strong>Tokens on Safe Squares (4 Stars and colored start squares) cannot be captured.</strong>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-ivory/10 border border-ivory/30">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Lock className="w-4 h-4" />
                <span>Blocking (Blockade)</span>
              </div>
              <p className="text-ivory text-xs leading-relaxed">
                When you have two or more of your own tokens on the same square, they form a <strong>BLOCK</strong>. Opponents <strong>cannot land on OR pass</strong> a blocked square!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: 2-Player Mode Rules & Strategies */}
        {activeTab === '2player' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm text-mist">
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Swords className="w-4 h-4 text-ruby" />
                <span>2-Player Mode Overview</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                Played with 2 opposite colors (e.g. <strong>Blue vs Green</strong> or <strong>Red vs Yellow</strong>) for maximum board symmetry. Each player controls 4 tokens. All core rules (roll 6 to exit, extra turns, 3-sixes rule, exact home finish) apply!
              </p>
            </div>

            {/* Comparison Table */}
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60 overflow-hidden">
              <h4 className="font-bold text-ivory text-xs mb-2">2-Player vs 4-Player Comparison</h4>
              <div className="grid grid-cols-3 gap-1 text-[11px] border-b border-felt-600 pb-1 font-semibold text-mist">
                <span>Aspect</span>
                <span>2-Player Mode</span>
                <span>4-Player Mode</span>
              </div>
              <div className="divide-y divide-felt-700 text-[10px] text-mist">
                <div className="grid grid-cols-3 gap-1 py-1">
                  <span className="text-ivory font-medium">Pace</span>
                  <span className="text-jade">Faster &amp; intense</span>
                  <span>Longer, chaotic</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <span className="text-ivory font-medium">Board Control</span>
                  <span className="text-ivory">Stronger blockades</span>
                  <span>Hard to hold full board</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <span className="text-ivory font-medium">Capturing</span>
                  <span className="text-ruby">Direct &amp; frequent</span>
                  <span>Opportunistic</span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1">
                  <span className="text-ivory font-medium">Strategy</span>
                  <span>Direct blocks &amp; hunt</span>
                  <span>Balancing rivals</span>
                </div>
              </div>
            </div>

            {/* 2-Player Strategies */}
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60 space-y-1.5 text-xs">
              <h4 className="font-bold text-jade">2-Player Master Tricks:</h4>
              <p>• <strong>Get multiple tokens out early:</strong> Having only one token on the board leaves you exposed to immediate hunting.</p>
              <p>• <strong>Use blocks aggressively:</strong> With only one opponent, a single well-placed blockade can completely choke their progress.</p>
              <p>• <strong>Protect your lead:</strong> Once you have 2–3 tokens in the home stretch, play defensively and force the opponent to gamble.</p>
              <p>• <strong>Control center paths:</strong> The squares right before the opponent&apos;s home entrance are critical chokepoints.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Team Up Mode (2 vs 2) */}
        {activeTab === 'teams' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm text-mist">
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <div className="flex items-center gap-2 text-ivory font-bold mb-1">
                <Users className="w-4 h-4 text-sapphire" />
                <span>What is Team Up Mode?</span>
              </div>
              <p className="text-mist text-xs leading-relaxed">
                Four players form two teams of two:
                <br />
                • <strong>Team 1:</strong> Blue + Green (Teammates)
                <br />
                • <strong>Team 2:</strong> Red + Yellow (Teammates)
                <br />
                The goal is for your <strong>entire team</strong> to get all 8 tokens into the center home triangle!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-ivory/10 border border-ivory/30 text-xs">
              <h4 className="font-bold text-ivory mb-1">Winning Condition:</h4>
              <p className="text-ivory text-xs leading-relaxed">
                A team wins only when <strong>both players</strong> on that team have moved all 4 tokens into home. If one player finishes first, the game continues and that finished player still rolls on their turn to support their partner!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60 space-y-1.5 text-xs">
              <h4 className="font-bold text-jade">Team Rules &amp; Synergy:</h4>
              <p>• <strong>Friendly Fire Off:</strong> You <strong>cannot capture</strong> your partner’s tokens! You can share squares safely.</p>
              <p>• <strong>Combined Team Blocks:</strong> Your tokens + your partner’s tokens form an impenetrable blockade that the opposing team cannot pass!</p>
              <p>• <strong>Sacrifice when needed:</strong> Sometimes letting an opponent token capture you clears the path for your partner to score or capture an enemy ace.</p>
              <p>• <strong>Focus fire:</strong> Both partners should target the same opponent to slow down the dangerous leader.</p>
            </div>
          </div>
        )}

        {/* Tab 4: General Strategy Tricks */}
        {activeTab === 'strategy' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm text-mist">
            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <h3 className="font-bold text-jade text-xs uppercase tracking-wider mb-1">
                01. Early Game
              </h3>
              <p className="text-mist text-xs leading-relaxed">
                • <strong>Get 2–3 tokens out ASAP:</strong> Don&apos;t keep tokens locked in your base.<br />
                • <strong>Use initial 6s wisely:</strong> Bringing a second token out is often better than advancing one far alone.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <h3 className="font-bold text-ivory text-xs uppercase tracking-wider mb-1">
                02. Middle Game – Best Tricks
              </h3>
              <p className="text-mist text-xs leading-relaxed">
                • <strong>Protect with stars:</strong> Park important tokens on star squares whenever possible.<br />
                • <strong>Block smartly:</strong> Use two tokens to create a blockade on key choke points, especially near opponents’ home stretches.<br />
                • <strong>Capture when it hurts:</strong> Prioritize capturing tokens that are close to their home or are the opponent’s furthest token.<br />
                • <strong>Don’t over-extend:</strong> Keep tokens somewhat together for mutual protection.<br />
                • <strong>Calculate risks:</strong> Check if an opponent can reach you before landing just short of them.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60">
              <h3 className="font-bold text-sapphire text-xs uppercase tracking-wider mb-1">
                03. Late Game &amp; Mind Games
              </h3>
              <p className="text-mist text-xs leading-relaxed">
                • <strong>Home column safety:</strong> Once inside your colored home column, tokens cannot be captured.<br />
                • <strong>Force wasted turns:</strong> Trap opponents behind your blockades.<br />
                • <strong>Bait tokens:</strong> Leave a token in a slightly risky position to lure opponents into capturing while setting up an ambush.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-felt-700/50 border border-felt-600/60 text-ruby">
              <h3 className="font-bold text-ruby text-xs uppercase tracking-wider mb-1">
                04. Mistakes to Avoid
              </h3>
              <p className="text-xs leading-relaxed">
                ⚠️ Leaving a token alone far from home with no safe square nearby.<br />
                ⚠️ Bringing out the last token too late.<br />
                ⚠️ Ignoring blocks and safe star squares.<br />
                ⚠️ Chasing every capture instead of progressing your own tokens.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-felt-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-ivory hover:bg-ivory font-bold text-felt-950 text-sm transition shadow-lg active:scale-98"
          >
            Got It! Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
