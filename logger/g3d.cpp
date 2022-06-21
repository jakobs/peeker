#include "g3d.hpp"
#include <sstream>

g3d::log g3dl;

namespace g3d {
std::string to_string( const label& l )
{
    std::stringstream ss;
    ss << l.name;
    ss << "_";
    ss << l.index;
    return ss.str();
}
}

