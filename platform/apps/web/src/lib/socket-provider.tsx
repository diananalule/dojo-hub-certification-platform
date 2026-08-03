'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth-context';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

// A ref, not state: the socket instance is used imperatively (emit/on) by consumers,
// not read reactively during render, so it doesn't need to trigger re-renders.
const SocketContext = createContext<{ current: Socket | null }>({ current: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(`${SOCKET_URL}/realtime`, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.on('notification.new', (notification?: { type?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // A student just submitted: refresh the reviewer's queue and headline counts
      // so the new item appears at the top without a manual reload.
      if (notification?.type === 'SUBMISSION_RECEIVED') {
        queryClient.invalidateQueries({ queryKey: ['submissions', 'queue'] });
      }
      // The reviewer's decision landed: refresh what the student is looking at.
      if (notification?.type === 'SUBMISSION_GRADED') {
        queryClient.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      }
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);

  return <SocketContext.Provider value={socketRef}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext).current;
}
