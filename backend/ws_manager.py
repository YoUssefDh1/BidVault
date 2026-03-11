from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        # Maps auction_id -> list of connected WebSockets
        self.rooms: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, auction_id: int):
        """Accept a new WebSocket connection and add it to the auction room."""
        await websocket.accept()
        if auction_id not in self.rooms:
            self.rooms[auction_id] = []
        self.rooms[auction_id].append(websocket)
        print(f"[WS] Client connected to auction {auction_id} "
              f"({len(self.rooms[auction_id])} viewers)")

    def disconnect(self, websocket: WebSocket, auction_id: int):
        """Remove a WebSocket from its auction room."""
        if auction_id in self.rooms:
            self.rooms[auction_id].remove(websocket)
            print(f"[WS] Client disconnected from auction {auction_id} "
                  f"({len(self.rooms[auction_id])} viewers left)")

    async def broadcast(self, auction_id: int, data: dict):
        """Send a JSON message to every client watching a specific auction."""
        viewers = self.rooms.get(auction_id, [])
        disconnected = []

        for websocket in viewers:
            try:
                await websocket.send_json(data)
            except Exception:
                # Client disconnected unexpectedly — clean up later
                disconnected.append(websocket)

        # Remove any dead connections
        for websocket in disconnected:
            self.rooms[auction_id].remove(websocket)

    def viewer_count(self, auction_id: int) -> int:
        return len(self.rooms.get(auction_id, []))


# Single shared instance used across the whole app
manager = ConnectionManager()