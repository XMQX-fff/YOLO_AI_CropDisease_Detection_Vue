import { io } from 'socket.io-client';
export class SocketService {
    socket;
    constructor() {
        this.socket = io('http://localhost:5000');
    }
    on(event, callback) {
        this.socket.on(event, (data) => callback(data.data));
    }
    emit(event, data) {
        this.socket.emit(event, data);
    }
    disconnect() {
        this.socket.disconnect();
    }
}
