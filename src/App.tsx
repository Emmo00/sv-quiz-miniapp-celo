import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { useAccount, useConnect, useSignMessage, useSwitchChain } from "wagmi";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Rocket, Share, RotateCcw, Sparkles } from "lucide-react";
import { useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./config";
import { base, celo } from "viem/chains";
import { toast } from "sonner";

const questions = [
  {
    id: 1,
    question: "What's your approach to solving complex problems?",
    options: [
      {
        text: "Break it down methodically and code the perfect solution",
        character: "gilfoyle",
      },
      {
        text: "Rally the team and pivot until we find what works",
        character: "richard",
      },
      {
        text: "Throw money at it until someone else fixes it",
        character: "gavin",
      },
      { text: "Wing it with confidence and charm", character: "erlich" },
    ],
  },
  {
    id: 2,
    question: "How do you handle workplace conflicts?",
    options: [
      {
        text: "Deliver brutal honesty with zero filter",
        character: "gilfoyle",
      },
      { text: "Try to mediate and find common ground", character: "richard" },
      {
        text: "Use corporate speak to deflect responsibility",
        character: "gavin",
      },
      { text: "Make it about yourself somehow", character: "erlich" },
    ],
  },
  {
    id: 3,
    question: "What's your ideal work environment?",
    options: [
      {
        text: "Dark room, multiple monitors, minimal human contact",
        character: "gilfoyle",
      },
      {
        text: "Collaborative space with whiteboards everywhere",
        character: "richard",
      },
      {
        text: "Corner office with a view and expensive furniture",
        character: "gavin",
      },
      {
        text: "Anywhere I can be the center of attention",
        character: "erlich",
      },
    ],
  },
  {
    id: 4,
    question: "How do you celebrate success?",
    options: [
      { text: "Quietly enjoy being right, as usual", character: "gilfoyle" },
      { text: "Share credit with the entire team", character: "richard" },
      { text: "Take all the credit in a press release", character: "gavin" },
      {
        text: "Throw an elaborate party and make speeches",
        character: "erlich",
      },
    ],
  },
  {
    id: 5,
    question: "What's your relationship with money?",
    options: [
      {
        text: "It's nice, but not worth compromising principles",
        character: "gilfoyle",
      },
      {
        text: "Important for building something meaningful",
        character: "richard",
      },
      { text: "The ultimate measure of success and power", character: "gavin" },
      { text: "Should flow freely, especially toward me", character: "erlich" },
    ],
  },
  {
    id: 6,
    question: "How do you handle failure?",
    options: [
      { text: "Analyze what went wrong and fix it", character: "gilfoyle" },
      {
        text: "Learn from it and try a different approach",
        character: "richard",
      },
      { text: "Blame others and restructure the team", character: "gavin" },
      { text: "Pretend it never happened", character: "erlich" },
    ],
  },
];

const characters = {
  gilfoyle: {
    name: "Gilfoyle",
    emoji: "🤖",
    quote: "There's no 'we' in team, but there's a 'me'.",
    description:
      "You're the brutally honest, backend wizard with zero tolerance for BS. Your code is flawless, your sarcasm is legendary.",
    color: "from-green-400 to-cyan-400",
  },
  richard: {
    name: "Richard Hendricks",
    emoji: "👨‍💻",
    quote: "We're making the world a better place through software.",
    description:
      "You're the idealistic founder with big dreams and bigger anxiety. You genuinely want to change the world.",
    color: "from-blue-400 to-purple-400",
  },
  gavin: {
    name: "Gavin Belson",
    emoji: "👔",
    quote:
      "I don't want to live in a world where someone else makes the world a better place better than we do.",
    description:
      "You're the corporate overlord with unlimited resources and questionable ethics. Power is your middle name.",
    color: "from-red-400 to-pink-400",
  },
  erlich: {
    name: "Erlich Bachman",
    emoji: "🎭",
    quote: "I'm not a businessman, I'm a business, man.",
    description:
      "You're the self-proclaimed visionary who talks big and delivers... well, you deliver great speeches.",
    color: "from-yellow-400 to-orange-400",
  },
};

export default function SiliconValleyQuiz() {
  const [screen, setScreen] = useState<"welcome" | "quiz" | "results">(
    "welcome"
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const {
    writeContract,
    writeContractAsync,
    data: mintTransactionHash,
    isPending: isMinting,
    isError: errorWhileMinting,
    error: mintingError,
  } = useWriteContract({});
  const {
    isConnected,
    isConnecting,
    address,
    chainId: currentAccountChainId,
  } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  const handleAnswerSelect = (characterType: string) => {
    setSelectedAnswer(characterType);
    setShowFeedback(true);

    setTimeout(() => {
      const newAnswers = [...answers, characterType];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        const finalResult = newAnswers.reduce(
          (acc, answer) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const winner = Object.entries(finalResult).reduce((a, b) =>
          finalResult[a[0]] > finalResult[b[0]] ? a : b
        )[0];
        setResult(winner);
        setScreen("results");
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setScreen("welcome");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setResult(null);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  function handleShareCast() {
    sdk.actions.composeCast({
      text: `I just took the Silicon Valley character quiz and I'm ${characters[result as keyof typeof characters].name}!\n\n🤖💻 Check it out and see which character you are! #SiliconValleyQuiz`,
      embeds: [
        window.location.href, // Current page URL
      ],
    });
  }

  async function handleMintNFT() {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to mint the NFT.");

      connect({ connector: connectors[0], chainId: celo.id });
      return;
    }

    console.log("Minting NFT for address:", address);
    console.log("current chainID:", currentAccountChainId);
    console.log("Selected character result:", result);

    const resultHash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mintCharacter",
      args: [address, result],
      connector: connectors[0],
      account: await connectors[0].getAccounts()[0],
      chain: celo,
      chainId: celo.id,
    });
  }

  // connect wallet if not connected
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect({ connector: connectors[0], chainId: celo.id });
    }
  }, [isConnected, isConnecting, connect, connectors]);

  // switch to celo chain if not already connected
  useEffect(() => {
    if (isConnected && currentAccountChainId !== celo.id) {
      switchChain({
        chainId: celo.id,
      });
    }
  }, [isConnected, currentAccountChainId, switchChain]);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    if (mintTransactionHash) {
      toast.success("NFT minted successfully!", {
        description: "Check your wallet for the new NFT!",
        action: {
          label: "View on Celo Explorer",
          onClick: () => {
            window.open(
              `https://celoscan.io/tx/${mintTransactionHash}`,
              "_blank"
            );
          },
        },
      });
      console.log("Mint transaction hash:", mintTransactionHash);
    }
    if (errorWhileMinting) {
      toast.error("Error while minting NFT", {
        description: mintingError?.message || "An unknown error occurred.",
        duration: 5000, // Show for 5 seconds
      });

      console.error("Error while minting NFT:", mintingError);
    }
  }, [mintTransactionHash, errorWhileMinting]);

  if (screen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-xl animate-bounce delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-bounce delay-500"></div>
        </div>

        {/* Top-left icon */}
        <div className="absolute top-6 left-6 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg blur opacity-75 animate-pulse"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-sm border border-green-400/30 rounded-lg p-3">
              <Brain className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-purple-400 to-blue-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-['Poppins']">
                  Which Silicon Valley Character Are You?
                </h1>
              </div>

              <p className="text-xl text-slate-300 mb-12 font-['Inter'] leading-relaxed">
                Take the quiz. Discover your tech alter ego. Mint your NFT
                reward on Celo.
              </p>

              <div className="mb-8 flex justify-center">
                <Card className="bg-slate-700/40 border-slate-600/50 shadow-lg w-full max-w-xs">
                  <CardContent className="p-4 flex items-center justify-center">
                    {isConnected && address ? (
                      <span className="text-green-300 font-mono text-sm truncate">
                        Connected: {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    ) : (
                      <Button
                        onClick={() =>
                          connect({
                            connector: connectors[0],
                            chainId: celo.id,
                          })
                        }
                        className="bg-gradient-to-r from-green-400 to-cyan-400 text-slate-900 font-semibold rounded-lg px-4 py-2"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={() => setScreen("quiz")}
                className="group relative px-12 py-6 text-xl font-semibold bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-300 hover:to-cyan-300 text-slate-900 border-0 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-400/25"
              >
                <span className="flex items-center gap-3">
                  Start the Quiz
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse"></div>
          <div className="grid grid-cols-8 grid-rows-8 gap-4 opacity-10 absolute inset-0 p-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="border border-slate-600 rounded animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-screen p-6">
          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 font-['Inter']">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-slate-400 font-['Inter']">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-400 rounded-full blur opacity-30"></div>
              <Progress
                value={progress}
                className="relative h-3 bg-slate-800 border border-slate-700"
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-['Poppins'] text-center">
                  {question.question}
                </h2>

                <div className="grid gap-4 md:gap-6">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(option.character)}
                      disabled={showFeedback}
                      className={`group relative p-6 h-auto text-left text-lg font-['Inter'] transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedAnswer === option.character
                          ? "bg-gradient-to-r from-green-400/20 to-cyan-400/20 border-green-400 shadow-lg shadow-green-400/25"
                          : "bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 hover:border-slate-500"
                      } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                      variant="outline"
                    >
                      <span className="z-10 text-white group-hover:text-green-300 transition-colors duration-300 break-words whitespace-normal">
                        {option.text}
                      </span>
                      {selectedAnswer === option.character && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-lg animate-pulse"></div>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "results" && result) {
    const character = characters[result as keyof typeof characters];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Celebration Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.2),transparent_70%)] animate-pulse"></div>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-purple-400 rounded-full animate-bounce opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-3xl bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              {/* Result Title */}
              <div className="relative mb-8">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${character.color} rounded-2xl blur-xl opacity-30 animate-pulse`}
                ></div>
                <h1
                  className={`relative text-4xl md:text-5xl font-bold bg-gradient-to-r ${character.color} bg-clip-text text-transparent font-['Poppins'] flex items-center justify-center gap-4`}
                >
                  <span className="text-6xl">{character.emoji}</span>
                  You're {character.name}!
                </h1>
              </div>

              {/* Character Quote */}
              <div className="mb-8 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                <p className="text-2xl text-slate-200 font-['Inter'] italic">
                  "{character.quote}"
                </p>
              </div>

              {/* Character Description */}
              <p className="text-xl text-slate-300 mb-12 font-['Inter'] leading-relaxed">
                {character.description}
              </p>

              <div className="mb-8 flex justify-center">
                <Card className="bg-slate-700/40 border-slate-600/50 shadow-lg w-full max-w-xs">
                  <CardContent className="p-2 flex items-center justify-center">
                    {isConnected && address ? (
                      <span className="text-green-300 font-mono text-sm truncate">
                        Connected: {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    ) : (
                      <Button
                        onClick={() =>
                          connect({
                            connector: connectors[0],
                            chainId: celo.id,
                          })
                        }
                        className="bg-gradient-to-r from-green-400 to-cyan-400 text-slate-900 font-semibold rounded-lg px-4 py-2"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  className="group relative px-6 py-4 text-lg font-semibold bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-300 hover:to-red-300 text-white border-0 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  onClick={handleMintNFT}
                  // disabled={isMinting}
                >
                  {isMinting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Minting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Mint NFT
                    </span>
                  )}
                </Button>

                <Button
                  className="group relative px-6 py-4 text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 text-white border-0 rounded-xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleShareCast}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Share className="w-5 h-5" />
                    Share Cast
                  </span>
                </Button>

                <Button
                  onClick={resetQuiz}
                  className="group relative px-6 py-4 text-lg font-semibold bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-300 hover:to-cyan-300 text-slate-900 border-0 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Retake Quiz
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
