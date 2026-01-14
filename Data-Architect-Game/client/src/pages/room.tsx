import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RequireAuth, useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { GAME_TITLE } from "@/lib/gameStrings";
import { SCENARIOS } from "@/lib/scenarios";
import { Mascot } from "@/components/game/Mascot";
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Play, 
  Send,
  CheckCircle2,
  Copy,
  Briefcase,
  Target,
  ShieldAlert,
  FileText,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Hourglass,
  X,
  Plus,
  Plug,
  Search,
  LayoutDashboard,
  GraduationCap,
  Lock,
  Wrench,
  Megaphone,
  UserCog,
} from "lucide-react";

interface ActionInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  effects: string;
}

const ARCHITECT_ACTIONS: Record<string, ActionInfo> = {
  'deploy-simba': {
    id: 'deploy-simba',
    name: 'Deploy Simba Connectors',
    description: 'Install ODBC/JDBC drivers for improved connectivity',
    icon: Plug,
    effects: 'Latency -150ms, Cost +15',
  },
  'deploy-vdd': {
    id: 'deploy-vdd',
    name: 'Enable VDD Pilot',
    description: 'Self-service data discovery for business users',
    icon: Search,
    effects: 'Adoption +12, Support +10',
  },
  'deploy-dashboards': {
    id: 'deploy-dashboards',
    name: 'Publish Managed Dashboards',
    description: 'Deploy governed, curated dashboards',
    icon: LayoutDashboard,
    effects: 'Trust +8, Reliability +5',
  },
  'run-enablement': {
    id: 'run-enablement',
    name: 'Run Enablement',
    description: 'Training sessions and template deployment',
    icon: GraduationCap,
    effects: 'Support -12, Adoption +6',
  },
  'add-governance': {
    id: 'add-governance',
    name: 'Add Governance Policy',
    description: 'Implement new data governance controls',
    icon: Lock,
    effects: 'Governance +10, Trust +6',
  },
  'performance-tuning': {
    id: 'performance-tuning',
    name: 'Performance Tuning',
    description: 'Optimize queries and reduce latency',
    icon: Wrench,
    effects: 'Latency -250ms, Reliability +8',
  },
  'present-roadmap': {
    id: 'present-roadmap',
    name: 'Present Roadmap',
    description: 'Share strategic vision with stakeholders',
    icon: Megaphone,
    effects: 'Patience +15, Political -10',
  },
  'executive-escalation': {
    id: 'executive-escalation',
    name: 'Executive Escalation',
    description: 'Escalate to remove a constraint',
    icon: UserCog,
    effects: 'Remove constraint, Political -20',
  },
};

const PROSPECT_ACTIONS: Record<string, ActionInfo> = {
  'impose-constraint': {
    id: 'impose-constraint',
    name: 'Impose Constraint',
    description: 'Block a specific deployment type',
    icon: ShieldAlert,
    effects: 'Blocks capability for 2 turns',
  },
  'demand-poc': {
    id: 'demand-poc',
    name: 'Demand Proof-of-Concept',
    description: 'Require adoption to increase',
    icon: FileText,
    effects: 'Patience -10, POC required',
  },
  'request-security-review': {
    id: 'request-security-review',
    name: 'Request Security Review',
    description: 'Increase governance requirements',
    icon: ShieldAlert,
    effects: 'Risk -10, Governance req +10%',
  },
  'threaten-alternative': {
    id: 'threaten-alternative',
    name: 'Threaten Alternative',
    description: 'Signal you may choose a competitor',
    icon: AlertTriangle,
    effects: 'Patience -15, Political -15',
  },
  'approve-budget': {
    id: 'approve-budget',
    name: 'Approve Budget',
    description: 'Increase cost allowance',
    icon: TrendingUp,
    effects: 'Cost limit +20, Value -5',
  },
  'set-deadline': {
    id: 'set-deadline',
    name: 'Set Deadline',
    description: 'Reduce remaining time',
    icon: Hourglass,
    effects: 'Removes 2 turns',
  },
  'share-requirements': {
    id: 'share-requirements',
    name: 'Share Requirements',
    description: 'Provide detailed requirements',
    icon: FileText,
    effects: 'Value +5, Political +10',
  },
  'acknowledge-progress': {
    id: 'acknowledge-progress',
    name: 'Acknowledge Progress',
    description: 'Show good faith and appreciation',
    icon: CheckCircle2,
    effects: 'Patience +10, Value +5',
  },
};

interface RoomData {
  room: {
    id: string;
    code: string;
    scenarioId: string;
    status: string;
    currentTurn: number;
    phase: string;
  };
  player: {
    id: string;
    role: string;
  };
  players: Array<{ id: string; role: string }>;
  gameState: any;
  currentTurn: any;
  myPlannedAction: any;
  opponentSubmitted: boolean;
  availableActions: string[];
}

interface PlannedActionItem {
  actionType: string;
  targetNodeId?: string;
  parameters?: Record<string, any>;
}

function RoomContent() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [plannedActions, setPlannedActions] = useState<PlannedActionItem[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data: roomData, isLoading, error } = useQuery<RoomData>({
    queryKey: ["/api/rooms", roomId],
  });

  useEffect(() => {
    if (!roomId || !user) return;

    const newSocket = io({
      path: "/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join-room", { roomId, userId: user.id });
    });

    newSocket.on("player-joined", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
    });

    newSocket.on("game-started", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      toast({
        title: "Game Started",
        description: "Both players are ready. Let the game begin!",
      });
    });

    newSocket.on("phase-change", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      setHasSubmitted(false);
      setPlannedActions([]);
    });

    newSocket.on("player-submitted", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
    });

    newSocket.on("turn-resolved", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      setHasSubmitted(false);
      setPlannedActions([]);
      toast({
        title: `Turn ${data.turnNumber} Resolved`,
        description: data.result?.summary || "Check the results!",
      });
    });

    newSocket.on("game-over", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      toast({
        title: data.winner ? `${data.winner} Wins!` : "Game Over",
        description: data.reason,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave-room");
      newSocket.disconnect();
    };
  }, [roomId, user, queryClient, toast]);

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/rooms/${roomId}/start`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
      toast({
        title: "Game Started",
        description: "Good luck!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Start Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (actions: PlannedActionItem[]) => {
      const response = await apiRequest("POST", `/api/rooms/${roomId}/submit`, { actions });
      return response.json();
    },
    onSuccess: (data) => {
      setHasSubmitted(true);
      if (data.waitingForOpponent) {
        toast({
          title: "Actions Submitted",
          description: "Waiting for your opponent...",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/rooms", roomId] });
    },
    onError: (error: any) => {
      toast({
        title: "Submit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyCode = () => {
    if (roomData?.room.code) {
      navigator.clipboard.writeText(roomData.room.code);
      toast({
        title: "Code Copied",
        description: "Share this code with your opponent",
      });
    }
  };

  const addAction = (actionType: string) => {
    if (plannedActions.length >= 2) {
      toast({
        title: "Max Actions",
        description: "You can only select 2 actions per turn",
        variant: "destructive",
      });
      return;
    }
    if (plannedActions.some(a => a.actionType === actionType)) {
      toast({
        title: "Already Selected",
        description: "This action is already in your plan",
        variant: "destructive",
      });
      return;
    }
    setPlannedActions([...plannedActions, { actionType }]);
  };

  const removeAction = (index: number) => {
    setPlannedActions(plannedActions.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading room...</div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This room doesn't exist or you don't have access.
          </p>
          <Button onClick={() => setLocation("/lobby")} data-testid="button-back-lobby">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lobby
          </Button>
        </Card>
      </div>
    );
  }

  const { room, player, players, gameState, availableActions } = roomData;
  const scenario = SCENARIOS.find(s => s.id === room.scenarioId);
  const isArchitect = player.role === "ARCHITECT";
  // Show waiting UI if status is "waiting" OR if we have 2 players but no gameState yet (ready to start)
  const isWaitingForPlayers = room.status === "waiting" && players.length < 2;
  const isReadyToStart = (room.status === "waiting" || room.status === "active") && players.length === 2 && !gameState;
  const isWaiting = isWaitingForPlayers || isReadyToStart;
  const isPlaying = room.status === "playing" && gameState;
  const actionsMap = isArchitect ? ARCHITECT_ACTIONS : PROSPECT_ACTIONS;
  const alreadySubmitted = hasSubmitted || roomData.myPlannedAction;

  const metrics = gameState?.metrics;
  const archMetrics = metrics?.architect;
  const prospMetrics = metrics?.prospect;

  return (
    <div className="min-h-screen bg-background p-4" data-testid="room-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/lobby")} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Mascot expression={isWaiting ? "normal" : gameState?.gameOver ? "worried" : "excited"} size="md" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{GAME_TITLE}</h1>
                <p className="text-sm text-muted-foreground">{scenario?.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {room.code}
              </Badge>
              <Button variant="ghost" size="icon" onClick={copyCode} data-testid="button-copy-code">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Badge className={isArchitect ? "bg-blue-500" : "bg-orange-500"}>
              {isArchitect ? (
                <>
                  <Briefcase className="w-3 h-3 mr-1" />
                  Architect
                </>
              ) : (
                <>
                  <Target className="w-3 h-3 mr-1" />
                  Prospect
                </>
              )}
            </Badge>
          </div>
        </div>

        {isWaiting ? (
          <Card className="p-8 text-center max-w-lg mx-auto">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <h2 className="text-xl font-bold text-foreground mb-2">Waiting for Opponent</h2>
            <p className="text-muted-foreground mb-4">
              Share your room code with another player to start the game.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className="font-mono text-2xl px-4 py-2">
                {room.code}
              </Badge>
              <Button variant="outline" size="icon" onClick={copyCode} data-testid="button-copy-code-large">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Users className="w-4 h-4" />
              {players.length}/2 players
            </div>
            {players.length === 2 && (
              <Button 
                onClick={() => startGameMutation.mutate()} 
                disabled={startGameMutation.isPending}
                data-testid="button-start-game"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            )}
          </Card>
        ) : gameState?.gameOver ? (
          <Card className="p-8 text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {gameState.winner ? `${gameState.winner} Wins!` : "Game Over"}
            </h2>
            <p className="text-muted-foreground mb-4">{gameState.endReason}</p>
            <Button onClick={() => setLocation("/lobby")} data-testid="button-back-lobby-end">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold">Turn {room.currentTurn}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{room.phase}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {room.currentTurn}/{gameState?.maxTurns || 12}
                  </span>
                </div>
              </div>

              {room.phase === "planning" && !alreadySubmitted && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Select Your Actions ({plannedActions.length}/2)</h3>
                  </div>
                  
                  {plannedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                      {plannedActions.map((action, index) => {
                        const info = actionsMap[action.actionType];
                        const Icon = info?.icon || FileText;
                        return (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 gap-2">
                            <Icon className="w-3 h-3" />
                            {info?.name || action.actionType}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => removeAction(index)}
                              data-testid={`button-remove-action-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <ScrollArea className="h-64">
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(availableActions || []).map((actionId) => {
                        const info = actionsMap[actionId];
                        if (!info) return null;
                        const Icon = info.icon;
                        const isSelected = plannedActions.some(a => a.actionType === actionId);
                        return (
                          <button
                            key={actionId}
                            onClick={() => addAction(actionId)}
                            disabled={isSelected || plannedActions.length >= 2}
                            className={`p-3 text-left rounded-lg border transition-colors hover-elevate ${
                              isSelected 
                                ? "bg-primary/10 border-primary" 
                                : "bg-card border-border"
                            } ${plannedActions.length >= 2 && !isSelected ? "opacity-50" : ""}`}
                            data-testid={`button-action-${actionId}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-md ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {info.name}
                                  {isSelected && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">{info.description}</div>
                                <div className="text-xs text-muted-foreground/80 mt-1">{info.effects}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-4 border-t gap-4">
                    <Button
                      onClick={() => submitMutation.mutate(plannedActions)}
                      disabled={plannedActions.length === 0 || submitMutation.isPending}
                      data-testid="button-submit-turn"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Turn ({plannedActions.length} actions)
                    </Button>
                    
                    {roomData.opponentSubmitted && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Opponent ready
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {(room.phase === "planning" && alreadySubmitted) && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">Actions Submitted</h3>
                  <p className="text-muted-foreground">
                    {roomData.opponentSubmitted 
                      ? "Resolving turn..." 
                      : "Waiting for your opponent to submit..."}
                  </p>
                </div>
              )}

              {room.phase === "review" && (
                <div className="text-center py-8">
                  <Gauge className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                  <h3 className="text-lg font-medium mb-2">Turn {room.currentTurn - 1} Complete</h3>
                  <p className="text-muted-foreground">
                    Reviewing results... Next turn starting soon.
                  </p>
                </div>
              )}
            </Card>

            <div className="space-y-4">
              {archMetrics && (
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Architect Metrics
                  </h3>
                  <div className="space-y-3">
                    <MetricBar label="Adoption" value={archMetrics.adoption} target={75} />
                    <MetricBar label="Trust" value={archMetrics.trust} target={75} />
                    <MetricBar label="Governance" value={archMetrics.governanceCoverage} target={70} />
                    <MetricBar label="Reliability" value={archMetrics.reliability} target={70} />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Latency</span>
                      <span className={archMetrics.latency <= 1200 ? "text-green-500" : "text-yellow-500"}>
                        {Math.round(archMetrics.latency)}ms
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span className={archMetrics.cost <= 120 ? "text-green-500" : "text-yellow-500"}>
                        {Math.round(archMetrics.cost)}/turn
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {prospMetrics && (
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Prospect Metrics
                  </h3>
                  <div className="space-y-3">
                    <MetricBar label="Business Value" value={prospMetrics.businessValue} target={70} />
                    <MetricBar label="Risk" value={prospMetrics.risk} target={30} inverted />
                    <MetricBar label="Patience" value={prospMetrics.patience} target={10} warning={30} />
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <h3 className="font-medium mb-3">Players</h3>
                <div className="space-y-2">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {p.role === "ARCHITECT" ? (
                          <Briefcase className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Target className="w-4 h-4 text-orange-500" />
                        )}
                        <span className="text-sm">{p.role}</span>
                      </div>
                      {p.id === player.id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBar({ 
  label, 
  value, 
  target, 
  inverted = false,
  warning = 20,
}: { 
  label: string; 
  value: number; 
  target: number;
  inverted?: boolean;
  warning?: number;
}) {
  const isGood = inverted ? value <= target : value >= target;
  const isWarning = inverted ? value >= warning : value <= warning;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={isGood ? "text-green-500" : isWarning ? "text-red-500" : "text-yellow-500"}>
          {Math.round(value)}%
        </span>
      </div>
      <Progress 
        value={value} 
        className="h-2"
      />
    </div>
  );
}

export default function RoomPage() {
  return (
    <RequireAuth>
      <RoomContent />
    </RequireAuth>
  );
}
