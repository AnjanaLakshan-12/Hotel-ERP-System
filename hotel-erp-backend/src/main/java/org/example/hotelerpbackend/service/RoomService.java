package org.example.hotelerpbackend.service;

import org.example.hotelerpbackend.entity.Room;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.example.hotelerpbackend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(Room room) {
        roomRepository.findByRoomNumber(room.getRoomNumber()).ifPresent(existing -> {
            throw new RuntimeException("Room number already exists");
        });

        if (room.getStatus() == null) {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE);
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Room updateRoom(Long id, Room room) {
        Room existing = getRoomById(id);

        existing.setRoomNumber(room.getRoomNumber());
        existing.setRoomType(room.getRoomType());
        existing.setPricePerNight(room.getPricePerNight());
        existing.setStatus(room.getStatus());

        return roomRepository.save(existing);
    }

    public Room updateRoomStatus(Long id, RoomStatus status) {
        Room room = getRoomById(id);
        room.setStatus(status);
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        Room existing = getRoomById(id);
        roomRepository.delete(existing);
    }
}
