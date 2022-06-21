project(g3dlog)

include_directories(.)
add_library(g3dlog g3d.cpp)
target_include_directories(g3dlog INTERFACE .)

