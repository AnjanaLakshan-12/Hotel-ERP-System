package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.Room;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);

    List<Room> findByStatus(RoomStatus status);
}
