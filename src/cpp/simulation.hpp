#ifndef SIMULATION_HPP
#define SIMULATION_HPP

#include <vector>
#include <string>
#include <cstdint>

enum class RoomType {
    EMPTY = 0,
    LOBBY,
    OFFICE,
    CONDOMINIUM,
    ELEVATOR
};

struct Cell {
    RoomType type;
    int ownerId;
    int cost;
    bool built;
};

struct Economy {
    int funds;
    int dailyIncome;
    int dailyExpenses;
};

class Simulation {
private:
    int width;
    int height;
    std::vector<std::vector<Cell>> grid;
    Economy economy;

public:
    Simulation(int w, int h);
    ~Simulation();

    bool buildRoom(int x, int y, int w, int h, int type);
    bool buildElevator(int shaftX, int startY, int endY);
    bool demolish(int x, int y);

    int getFunds() const;
    void update(float deltaTime);
    const uint8_t* getVisualBuffer() const;
};

#endif