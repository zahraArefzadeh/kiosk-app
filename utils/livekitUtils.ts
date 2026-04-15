// src/utils/livekitUtils.ts

interface ConnectionDetails {
  serverUrl: string;
  participantToken: string;
  participantName: string;
  roomName: string;
}

export async function getConnectionDetails(
  roomName?: string,
  participantName?: string
): Promise<ConnectionDetails> {
  try {
    // console.log('🔑 Requesting connection details...');

    const response = await fetch('/api/livekit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_name: roomName,
        participant_name: participantName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to get connection details: ${response.status}`
      );
    }

    const data = await response.json();

    // console.log('✅ Connection details received:', {
    //   serverUrl: data.serverUrl,
    //   roomName: data.roomName,
    //   participantName: data.participantName,
    //   hasToken: !!data.participantToken,
    // });

    // ✅ Validate response
    if (!data.serverUrl || !data.participantToken) {
      throw new Error('Invalid connection details received from server');
    }

    return {
      serverUrl: data.serverUrl,
      participantToken: data.participantToken,
      participantName: data.participantName || 'anonymous',
      roomName: data.roomName || 'default-room',
    };
  } catch (error) {
    // console.error('❌ Failed to get connection details:', error);
    throw error;
  }
}
