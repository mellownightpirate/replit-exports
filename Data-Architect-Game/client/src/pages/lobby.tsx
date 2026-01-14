import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, RequireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { GAME_TITLE, GAME_SUBTITLE } from "@/lib/gameStrings";
import { SCENARIOS } from "@/lib/scenarios";
import { Mascot } from "@/components/game/Mascot";
import { 
  Plus, 
  Users, 
  LogOut, 
  Play, 
  Clock, 
  CheckCircle2, 
  Gamepad2,
  Rocket,
  Shield,
  Building2,
} from "lucide-react";

const SCENARIO_ICONS: Record<string, React.ElementType> = {
  'speed-to-value': Rocket,
  'governance-first': Shield,
  'scale-out': Building2,
};

interface RoomsResponse {
  myRooms: any[];
  availableRooms: any[];
}

function LobbyContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<string>(SCENARIOS[0]?.id || "");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: roomsData, isLoading } = useQuery<RoomsResponse>({
    queryKey: ["/api/rooms"],
  });

  const createRoomMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await apiRequest("POST", "/api/rooms", { scenarioId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setCreateDialogOpen(false);
      setLocation(`/room/${data.room.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/rooms/join", { code });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setLocation(`/room/${data.room.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join room",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = () => {
    if (selectedScenario) {
      createRoomMutation.mutate(selectedScenario);
    }
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 8) {
      joinRoomMutation.mutate(joinCode.toUpperCase());
    }
  };

  const myRooms = roomsData?.myRooms || [];
  const availableRooms = roomsData?.availableRooms || [];

  return (
    <div className="min-h-screen bg-background p-4" data-testid="lobby-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mascot expression="normal" size="md" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{GAME_TITLE}</h1>
              <p className="text-sm text-muted-foreground">{GAME_SUBTITLE}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="p-6 hover-elevate cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Create Room</h3>
                    <p className="text-sm text-muted-foreground">Start a new multiplayer game</p>
                  </div>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Scenario
                  </label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger data-testid="select-scenario">
                      <SelectValue placeholder="Choose a scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCENARIOS.map((scenario) => {
                        const Icon = SCENARIO_ICONS[scenario.id] || Gamepad2;
                        return (
                          <SelectItem key={scenario.id} value={scenario.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {scenario.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateRoom} 
                  className="w-full"
                  disabled={createRoomMutation.isPending}
                  data-testid="button-create-room"
                >
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-chart-2/10">
                <Users className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Join Room</h3>
                <p className="text-sm text-muted-foreground">Enter a room code</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="ABCD1234"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono uppercase"
                data-testid="input-room-code"
              />
              <Button 
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 8 || joinRoomMutation.isPending}
                data-testid="button-join-room"
              >
                Join
              </Button>
            </div>
          </Card>
        </div>

        {myRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Games</h2>
            <div className="space-y-3">
              {myRooms.map((room: any) => {
                const scenario = SCENARIOS.find(s => s.id === room.scenarioId);
                const Icon = SCENARIO_ICONS[room.scenarioId] || Gamepad2;
                
                return (
                  <Card 
                    key={room.id} 
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/room/${room.id}`)}
                    data-testid={`room-card-${room.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{room.code}</span>
                            <Badge variant="secondary" className="text-xs">
                              {room.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {scenario?.name || room.scenarioId} - Turn {room.currentTurn}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.status === "waiting" ? (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Waiting
                          </Badge>
                        ) : room.status === "active" ? (
                          <Badge className="gap-1 bg-green-500">
                            <Play className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Finished
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {room.playerCount}/2 players
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {availableRooms.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Available Rooms</h2>
            <div className="space-y-3">
              {availableRooms.map((room: any) => {
                const scenario = SCENARIOS.find(s => s.id === room.scenarioId);
                const Icon = SCENARIO_ICONS[room.scenarioId] || Gamepad2;
                
                return (
                  <Card 
                    key={room.id} 
                    className="p-4 hover-elevate cursor-pointer"
                    onClick={() => joinRoomMutation.mutate(room.code)}
                    data-testid={`available-room-${room.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="font-mono font-semibold">{room.code}</span>
                          <p className="text-sm text-muted-foreground">
                            {scenario?.name || room.scenarioId}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Join as Prospect
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading rooms...
          </div>
        )}

        {!isLoading && myRooms.length === 0 && availableRooms.length === 0 && (
          <Card className="p-8 text-center">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground mb-2">No games yet</h3>
            <p className="text-sm text-muted-foreground">
              Create a new room or join one with a code to start playing!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <RequireAuth>
      <LobbyContent />
    </RequireAuth>
  );
}
