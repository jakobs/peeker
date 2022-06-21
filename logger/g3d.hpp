#pragma once

#include "json.hpp"

#include <string>
#include <Eigen/Core>
#include <fstream>

namespace g3d {
    using namespace nlohmann;

    struct label;

    std::string to_string( const label& l );

    struct label {
        std::string name;
        int index;

        std::string str()
        {
            return to_string(*this);
        }
    };

    struct log
    {
        json jobj;
        std::string filename;

        void init( std::string const& filename )
        {
            this->filename = filename;
            jobj = json::array();
        }

        virtual ~log() 
        {
            if( !this->filename.empty() ) 
            {
                std::ofstream o(this->filename);
                o << jobj;
            }
        }

        template <class T> 
        void addFrame( std::string const& name, Eigen::Matrix<T,3,1> const& translation, Eigen::Quaternion<T> const& rotation )
        {
            jobj.emplace_back( json{
                    {"type", "frame"}, 
                    {"name", name}, 
                    {"translation", {
                        {"x", translation.x()},
                        {"y", translation.y()},
                        {"z", translation.z()} }},
                    {"rotation", {
                        {"x", rotation.x()},
                        {"y", rotation.y()},
                        {"z", rotation.z()},
                        {"w", rotation.w()} }}
                    } );
        }

        template <class T>
        void addRect( std::string const& frame, T width, T height, std::string const& set = "default" )
        {
            jobj.emplace_back( json{
                    {"type", "rect"}, 
                    {"frame", frame},
                    {"set", set},
                    {"width", width},
                    {"height", height}
                    } );
        }
    };
}

extern g3d::log g3dl;
