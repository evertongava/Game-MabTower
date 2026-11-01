#include "simulation.hpp"
#include <algorithm>

Simulation::Simulation(int w, int h) : width(w), height(h) {
    economy.funds = 100000;
    economy.dailyIncome = 0;
    economy.dailyExpenses = 0;
    grid.resize(height, std::vector<Cell>(width, {RoomType::EMPTY, 0, 0, false}));
}

Simulation::~Simulation() {}

bool Simulation::buildRoom(int x, int y, int w, int h, int typeInt) {
    RoomType type = static_cast<RoomType>(typeInt);
    if (x < 0 || y < 0 || x + w > width || y + h > height) return false;

    int costPerTile = 500;
    int totalCost = w * h * costPerTile;
    if (economy.funds < totalCost) return false;

    for (int dy = 0; dy < h; ++dy) {
        for (int dx = 0; dx < w; ++dx) {
            grid[y + dy][x + dx] = {type, 1, costPerTile, true};
        }
    }
    economy.funds -= totalCost;
    return true;
}

bool Simulation::buildElevator(int shaftX, int startY, int endY) {
    if (shaftX < 0 || shaftX >= width || startY < 0 || endY >= height || startY > endY) return false;

    int heightSpan = (endY - startY) + 1;
    int cost = heightSpan * 1000;
    if (economy.funds < cost) return false;

    for (int y = startY; y <= endY; ++y) {
        grid[y][shaftX] = {RoomType::ELEVATOR, 1, 1000, true};
    }
    economy.funds -= cost;
    return true;
}

bool Simulation::demolish(int x, int y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    grid[y][x] = {RoomType::EMPTY, 0, 0, false};
    return true;
}

int Simulation::getFunds() const {
    return economy.funds;
}

void Simulation::update(float deltaTime) {}

const uint8_t* Simulation::getVisualBuffer() const {
    return reinterpret_cast<const uint8_t*>(grid.data());
}