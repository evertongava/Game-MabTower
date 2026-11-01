CXX = em++
TARGET = build/simulation.wasm
SRC = src/cpp/simulation.cpp src/cpp/bindings.cpp

CXXFLAGS = -O3 \
           -s WASM=1 \
           -s MODULARIZE=1 \
           -s EXPORT_ES6=1 \
           -s EXPORTED_RUNTIME_METHODS='["cwrap", "ccall"]' \
           -s ALLOW_MEMORY_GROWTH=1 \
           --bind

all: $(TARGET)

$(TARGET): $(SRC)
	mkdir -p build
	$(CXX) $(SRC) $(CXXFLAGS) -o build/simulation.js

clean:
	rm -rf build/*