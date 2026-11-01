#include <emscripten/bind.h>
#include "simulation.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(SimTowerSimulation) {
    class_<Simulation>("Simulation")
        .constructor<int, int>()
        .function("buildRoom", &Simulation::buildRoom)
        .function("buildElevator", &Simulation::buildElevator)
        .function("demolish", &Simulation::demolish)
        .function("getFunds", &Simulation::getFunds)
        .function("update", &Simulation::update);
}