function secToHms(sec) {

    let hours = Math.floor(sec / 3600);
    sec %= 3600;
    let minutes = Math.floor(sec / 60);
    let seconds = sec % 60;

    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");
    return hours + ":" + minutes + ":" + seconds;
}


function getViewButton(flight_id) {
    return '<button type="button" class="btn btn-default viewer" data-id="' + flight_id.toString() + '" data-bs-toggle="modal" data-bs-target="#mapModal"><i class="far fa-eye" data-bs-toggle="tooltip" data-bs-placement="bottom" title="view flight"></i></button>'


}

function redrawWingsFilter(wings) {
    filterHTML = '<li><a class="dropdown-item wing_item" id="wing_0" href="#"> - All wings - </a></li>'
    wings.forEach((wing) => {
        filterHTML += '<li><a class="dropdown-item wing_item" id="' + wing.replace(" ", ".") + '" href="#">' + wing + '</a></li>'
    });
    $("#wingsFilter").html(filterHTML);
}

function redrawYearsFilter(years) {
    filterHTML = '<li><a class="dropdown-item year_item" id="season_0" href="#"> - All seasons - </a></li>'
    years.forEach((year) => {
        filterHTML += '<li><a class="dropdown-item year_item" id="' + year.toString() + '" href="#">' + year.toString() + '</a></li>'
    });
    $("#yearsFilter").html(filterHTML);
}

function redrawSitesFilter(sites) {
    filterHTML = '<li><p class="text-center"><input type="text" class="form-control-sm" id="site_input" placeholder="Search" autofocus></p></li>'
    filterHTML += '<li class="filterable"><a class="dropdown-item site_item" id="site_0" href="#"> - All sites - </a></li>'
    sites.forEach((site) => {
        filterHTML += '<li class="filterable"><a class="dropdown-item site_item" id="' + site.replace(" ", ".") + '" href="#">' + site + '</a></li>'
    });
    $("#sitesFilter").html(filterHTML);
}

function setViewer(id, hasIGC) {
    console.log(id+'//'+hasIGC)
    if (hasIGC) {
        console.log('hasIGC')
        var latlngs = []

        // var myCollapse = document.getElementById('collapseExample')
        // var bsCollapse = new bootstrap.Collapse(myCollapse, {
        //     toggle: true
        // })
        $.getJSON(id + ".js", function(fixes) {

            if ($('#mapinsert').hasClass('leaflet-container')) {
                console.log('has_class')
                $('#mapinsert').remove();
                $('<div id="mapinsert" class="modal-body"></div>').insertAfter("#before_modal");
            }
            var gps_alt_data = []
            var baro_alt_data = []
            var flight = filteredData.find(t => t.id === id)
            var indix = 0;
            maxgps = Math.max.apply(Math, fixes.map(function(o) { return o.gpsalt; }))
            maxbaro = Math.max.apply(Math, fixes.map(function(o) { return o.pressalt; }))
            if (maxbaro > maxgps) {
                ceil = maxbaro
            } else {
                ceil = maxgps
            }
            for (let fix of fixes) {
                latlngs.push([fix.lat, fix.lng]);
                //gps_alt_data.push({ indix: indix, date: new Date(2018, 3, 20, fix.time.h, fix.time.m, fix.time.s), gpsalt: fix.gpsalt, pressalt: fix.pressalt, lat: fix.lat, lng: fix.lng })
                gps_alt_data.push([new Date(Date.UTC(2018, 3, 20, fix.time.h, fix.time.m, fix.time.s, 0)).getTime(), fix.gpsalt, fix.gpsalt, fix.lat, fix.lng])
                baro_alt_data.push([new Date(Date.UTC(2018, 3, 20, fix.time.h, fix.time.m, fix.time.s, 0)).getTime(), fix.pressalt, fix.pressalt])
                indix += 1;
            }

            var mymap = L.map('mapinsert').setView([flight.latTo, flight.longTo], 13);
            var polyline = L.polyline(latlngs, { color: 'red' }).addTo(mymap);
            var greenIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const fontAwesomeIcon = L.divIcon({
                html: '<span class="fa-stack fa-2x"><i class="fas fa-square fa-stack-2x"></i> <i class="fab fa-cloudversify fa-stack-1x fa-inverse"></i></span>',
                iconSize: [20, 20],
                className: 'myDivIcon'
            });
            cloud = L.marker([flight.latTo, flight.longTo], {
                icon: fontAwesomeIcon
            }).addTo(mymap)
            L.marker([flight.latTo, flight.longTo], { icon: greenIcon }).addTo(mymap);
            L.marker([latlngs[latlngs.length - 1][0], latlngs[latlngs.length - 1][1]], { icon: redIcon }).addTo(mymap);
            mymap.fitBounds(polyline.getBounds());
            // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            //     maxZoom: 18,
            //     id: 'mapbox/outdoors-v11',
            //     tileSize: 512,
            //     zoomOffset: -1,
            //     accessToken: 'pk.eyJ1IjoidXBza3kiLCJhIjoiY2tycWZlam1mMDc2bTJ1bzRrYWV0OWk3bSJ9.CfIBijQ6nqq07t7rZgXl8w'
            // }).addTo(mymap);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mymap);

            Highcharts.chart('chartdiv', {
                chart: {
                    type: 'area'
                },
                accessibility: {
                    description: 'Image description: An area chart compares the nuclear stockpiles of the USA and the USSR/Russia between 1945 and 2017. The number of nuclear weapons is plotted on the Y-axis and the years on the X-axis. The chart is interactive, and the year-on-year stockpile levels can be traced for each country. The US has a stockpile of 6 nuclear weapons at the dawn of the nuclear age in 1945. This number has gradually increased to 369 by 1950 when the USSR enters the arms race with 6 weapons. At this point, the US starts to rapidly build its stockpile culminating in 32,040 warheads by 1966 compared to the USSR’s 7,089. From this peak in 1966, the US stockpile gradually decreases as the USSR’s stockpile expands. By 1978 the USSR has closed the nuclear gap at 25,393. The USSR stockpile continues to grow until it reaches a peak of 45,000 in 1986 compared to the US arsenal of 24,401. From 1986, the nuclear stockpiles of both countries start to fall. By 2000, the numbers have fallen to 10,577 and 21,000 for the US and Russia, respectively. The decreases continue until 2017 at which point the US holds 4,018 weapons compared to Russia’s 4,500.'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'altitude'
                    },
                    ceiling: ceil,

                    labels: {
                        formatter: function() {
                            return this.value + ' m';
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} had stockpiled <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
                },
                plotOptions: {
                    area: {
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: [{
                        name: 'GPS',
                        keys: ['name', 'custom.value', 'y', 'custom.lat', 'custom.lng'],
                        point: {
                            events: {
                                mouseOver: function() {
                                    console.log('toto')
                                    var newLatLng = new L.LatLng(this.custom.lat, this.custom.lng);
                                    cloud.setLatLng(newLatLng);
                                }
                            }
                        },
                        data: gps_alt_data
                    },
                    {
                        name: 'Baro',
                        keys: ['name', 'custom.value', 'y'],
                        data: baro_alt_data
                    }
                ]
            });
        });

    } else {
        $('#mapinsert').html('<H1> There is no IGC data for this flight</H1>');
    }

}

function redrawTable(filteredData) {

    if ($.fn.dataTable.isDataTable('#flights_table')) {
        table = $('#flights_table').DataTable();
        table.clear().rows.add(filteredData).draw();

    } else {

        var table = $('#flights_table').DataTable({
            aaSorting: [
                [3, 'desc'],
                [4, 'desc']
            ],
            data: filteredData,
            responsive: true,
            rowGroup: {
                dataSrc: 2
            },
            columns: [{
                    data: 'id',
                    visible: false,
                    title: "id"
                }, {
                    data: 'hasIGC',
                    visible: false,
                    title: "hasIGC"
                }, {
                    data: 'null',
                    defaultContent: '<button type="button" class="btn btn-default table_viewer" data-bs-toggle="modal" data-bs-target="#mapModal"><i class="far fa-eye" data-bs-toggle="tooltip" data-bs-placement="bottom" title="view flight"></i></button>'
                }, {
                    data: 'date',
                    title: "Date"
                }, {
                    data: 'time',
                    title: "time"
                },
                {
                    data: 'site',
                    title: "Site"
                },
                {
                    data: 'country',
                    title: "country"
                },
                {
                    data: 'altTo',
                    title: "Take-off alt."
                },
                {
                    data: 'durationHms',
                    title: "Duration"
                }
            ]
        });
    }

}

function avgData(summed, count, noIgc) {
    avg = 0;
    if (summed > 0) {
        if ((count - noIgc) > 0) {
            avg = summed / (count - noIgc)
        } else {
            avg = 0;
        }

    } else {
        avg = 0;
    }
    return avg;
}

function redrawBadges(filteredData) {
    totalSeconds = 0;
    noIgcSeconds = 0;
    flightCount = 0;
    flightNoIGC = 0;
    max_dist_from_to = 0;
    sum_dist_from_to = 0;

    maxGPS_id = 0;
    maxBaro_id = 0;

    maxGPS = 0;
    maxBaro = 0;

    ffvl_max_score = 0;
    ffvl_total_score = 0;
    ffvl_avg_score = 0;

    ffvl_max_dist = 0;
    ffvl_total_dist = 0;
    ffvl_avg_dist = 0;

    xc_max_score = 0;
    xc_total_score = 0;
    xc_avg_score = 0;

    xc_max_dist = 0;
    xc_total_dist = 0;
    xc_avg_dist = 0;

    total_length = 0;

    max_speed = 0;
    avg_speed = 0;

    max_i_speed = 0;
    avg_i_speed = 0;

    g_max_speed = 0;
    g_avg_speed = 0;

    g_max_i_speed = 0;
    g_avg_i_speed = 0;

    t_max_speed = 0;
    t_avg_speed = 0;

    t_max_i_speed = 0;
    t_avg_i_speed = 0;

    sum_speed = 0
    sum_i_speed = 0

    g_sum_speed = 0
    g_sum_i_speed = 0

    t_sum_speed = 0
    t_sum_i_speed = 0

    max_vario = 0
    min_vario = 0

    max_vario_i = 0
    min_vario_i = 0


    filteredData.forEach((flight) => {
        totalSeconds += flight.duration;
        flightCount += 1;
        if (!flight.hasIGC) {
            noIgcSeconds += flight.duration;
            flightNoIGC += 1;
        } else {
            if (flight.analysed.max_vario > max_vario) {
                max_vario = flight.analysed.max_vario;
            }
            if (flight.analysed.min_vario < min_vario) {
                min_vario = flight.analysed.min_vario;
            }

            if (flight.analysed.max_vario_inst > max_vario_i) {
                max_vario_i = flight.analysed.max_vario_inst;
            }
            if (flight.analysed.min_vario_inst < min_vario_i) {
                min_vario_i = flight.analysed.min_vario_inst;
            }
            if (flight.analysed.max_instant_speed > max_speed) {
                max_speed = flight.analysed.max_instant_speed;
            }
            if (flight.analysed.max_integ_speed > max_i_speed) {
                max_i_speed = flight.analysed.max_integ_speed;
            }

            if (flight.analysed.g_max_instant_speed > g_max_speed) {
                g_max_speed = flight.analysed.g_max_instant_speed;
            }
            if (flight.analysed.g_max_integ_speed > g_max_i_speed) {
                g_max_i_speed = flight.analysed.g_max_integ_speed;
            }

            if (flight.analysed.t_max_instant_speed > t_max_speed) {
                t_max_speed = flight.analysed.t_max_instant_speed;
            }
            if (flight.analysed.t_max_integ_speed > max_i_speed) {
                t_max_i_speed = flight.analysed.t_max_integ_speed;
            }

            total_length += flight.analysed.trace_length
            if (flight.analysed.maxDistFromTo > max_dist_from_to) {
                max_dist_from_to = flight.analysed.maxDistFromTo;
            }
            if (flight.analysed.maxAltPressure > maxBaro) {
                maxBaro = flight.analysed.maxAltPressure
                maxBaro_id = flight.id
            }
            if (flight.analysed.maxAltGPS > maxGPS) {
                maxGPS = flight.analysed.maxAltGPS
                maxGPS_id = flight.id
            }


            if (flight.analysed.xcontest_score > xc_max_score) {
                xc_max_score = flight.analysed.xcontest_score
            }
            if (flight.analysed.xcontest_dist > xc_max_dist) {
                xc_max_dist = flight.analysed.xcontest_dist
            }
            if (flight.analysed.ffvl_score > ffvl_max_score) {
                ffvl_max_score = flight.analysed.ffvl_score
            }
            if (flight.analysed.ffvl_dist > ffvl_max_dist) {
                ffvl_max_dist = flight.analysed.ffvl_dist
            }
            sum_dist_from_to += flight.analysed.maxDistFromTo
            xc_total_score += flight.analysed.xcontest_score
            xc_total_dist += flight.analysed.xcontest_dist
            ffvl_total_score += flight.analysed.ffvl_score
            ffvl_total_dist += flight.analysed.ffvl_dist

            sum_speed += flight.analysed.avg_instant_speed
            sum_i_speed += flight.analysed.avg_integ_speed

            g_sum_speed += flight.analysed.g_avg_instant_speed
            g_sum_i_speed += flight.analysed.g_avg_integ_speed

            t_sum_speed += flight.analysed.t_avg_instant_speed
            t_sum_i_speed += flight.analysed.t_avg_integ_speed
        }
    });
    avg_speed = avgData(sum_speed, flightCount, flightNoIGC)
    avg_i_speed = avgData(sum_i_speed, flightCount, flightNoIGC)

    g_avg_speed = avgData(g_sum_speed, flightCount, flightNoIGC)
    g_avg_i_speed = avgData(g_sum_i_speed, flightCount, flightNoIGC)

    t_avg_speed = avgData(t_sum_speed, flightCount, flightNoIGC)
    t_avg_i_speed = avgData(t_sum_i_speed, flightCount, flightNoIGC)

    avg_dist_from_to = avgData(sum_dist_from_to, flightCount, flightNoIGC)
    xc_avg_score = avgData(xc_total_score, flightCount, flightNoIGC)
    xc_avg_dist = avgData(xc_total_dist, flightCount, flightNoIGC)
    ffvl_avg_score = avgData(ffvl_total_score, flightCount, flightNoIGC)
    ffvl_avg_dist = avgData(ffvl_total_dist, flightCount, flightNoIGC)


    if (flightNoIGC > 0) {
        //Thermaling
        t_avg_i_speed_h = '<span class="fs-2">' + t_avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        t_avg_speed_h = '<span class="fs-2">' + t_avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        t_max_speed_h = '<span class="fs-2">' + t_max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        t_max_i_speed_h = '<span class="fs-2">' + t_max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        //Gliding
        g_avg_i_speed_h = '<span class="fs-2">' + g_avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        g_avg_speed_h = '<span class="fs-2">' + g_avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        g_max_speed_h = '<span class="fs-2">' + g_max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        g_max_i_speed_h = '<span class="fs-2">' + g_max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        //overall
        avg_i_speed_h = '<span class="fs-2">' + avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        avg_speed_h = '<span class="fs-2">' + avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        max_speed_h = '<span class="fs-2">' + max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        max_i_speed_h = '<span class="fs-2">' + max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        max_vario_h = '<span class="fs-2">' + max_vario.toFixed(2) + ' m/s</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        min_vario_h = '<span class="fs-2">' + min_vario.toFixed(2) + ' m/s</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        max_vario_i_h = '<span class="fs-2">' + max_vario_i.toFixed(2) + ' m/s</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        min_vario_i_h = '<span class="fs-2">' + min_vario_i.toFixed(2) + ' m/s</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        avg_xc_dist = '<span class="fs-2">' + xc_avg_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        max_xc_dist = '<span class="fs-2">' + xc_max_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        sum_xc_dist = '<span class="fs-2">' + xc_total_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        avg_xc_score = '<span class="fs-2">' + xc_avg_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        max_xc_score = '<span class="fs-2">' + xc_max_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        sum_xc_score = '<span class="fs-2">' + xc_total_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        avg_ffvl_dist = '<span class="fs-2">' + ffvl_avg_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        max_ffvl_dist = '<span class="fs-2">' + ffvl_max_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        sum_ffvl_dist = '<span class="fs-2">' + ffvl_total_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        avg_ffvl_score = '<span class="fs-2">' + ffvl_avg_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        max_ffvl_score = '<span class="fs-2">' + ffvl_max_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
        sum_ffvl_score = '<span class="fs-2">' + ffvl_total_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

        alti_gps = '<span class="fs-2">' + maxGPS + ' m</span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span> ' + getViewButton(maxGPS_id);
        alti_baro = '<span class="fs-2">' + maxBaro + ' m</span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(maxBaro_id);
        duration = '<span class="fs-2">' + secToHms(totalSeconds) + ' </span> <span class="fw-lighter"><small>(' + secToHms(noIgcSeconds) + ' w/o IGC)</small></span>'
        count = '<span class="fs-2">' + flightCount + ' </span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        max_dist = '<span class="fs-2">' + max_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>'
        avg_dist = '<span class="fs-2">' + avg_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>'
        sum_dist = '<span class="fs-2">' + sum_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>'

        sum_trace = '<span class="fs-2">' + (total_length / 1000).toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span >'
    } else {
        avg_xc_dist = '<span class="fs-2">' + xc_avg_dist.toFixed(2) + ' Km</span>'
        max_xc_dist = '<span class="fs-2">' + xc_max_dist.toFixed(2) + ' Km</span>'
        sum_xc_dist = '<span class="fs-2">' + xc_total_dist.toFixed(2) + ' Km</span>'

        avg_xc_score = '<span class="fs-2">' + xc_avg_score.toFixed(2) + ' Pts.</span>'
        max_xc_score = '<span class="fs-2">' + xc_max_score.toFixed(2) + ' Pts.</span>'
        sum_xc_score = '<span class="fs-2">' + xc_total_score.toFixed(2) + ' Pts.</span>'

        avg_ffvl_dist = '<span class="fs-2">' + ffvl_avg_dist.toFixed(2) + ' Km</span>'
        max_ffvl_dist = '<span class="fs-2">' + ffvl_max_dist.toFixed(2) + ' Km</span>'
        sum_ffvl_dist = '<span class="fs-2">' + ffvl_total_dist.toFixed(2) + ' Km</span>'

        avg_ffvl_score = '<span class="fs-2">' + ffvl_avg_score.toFixed(2) + ' Pts.</span>'
        max_ffvl_score = '<span class="fs-2">' + ffvl_max_score.toFixed(2) + ' Pts.</span>'
        sum_ffvl_score = '<span class="fs-2">' + ffvl_total_score.toFixed(2) + ' Pts.</span>'

        max_vario_h = '<span class="fs-2">' + max_vario.toFixed(2) + ' m/s</span>'
        min_vario_h = '<span class="fs-2">' + min_vario.toFixed(2) + ' m/s</span>'
        max_vario_i_h = '<span class="fs-2">' + max_vario_i.toFixed(2) + ' m/s</span>'
        min_vario_i_h = '<span class="fs-2">' + min_vario_i.toFixed(2) + ' m/s</span>'

        alti_baro = '<span class="fs-2">' + maxBaro + ' m</span>' + getViewButton(maxBaro_id);
        alti_gps = '<span class="fs-2">' + maxGPS + ' m</span>' + getViewButton(maxGPS_id);
        duration = '<span class="fs-2">' + secToHms(totalSeconds) + ' </span>'
        count = '<span class="fs-2">' + flightCount + ' </span>'

        max_dist = '<span class="fs-2">' + max_dist_from_to.toFixed(2) + ' Km</span>'
        avg_dist = '<span class="fs-2">' + avg_dist_from_to.toFixed(2) + ' Km</span>'
        sum_dist = '<span class="fs-2">' + sum_dist_from_to.toFixed(2) + ' Km</span>'

        sum_trace = '<span class="fs-2">' + (total_length / 1000).toFixed(2) + ' Km</span>'
        // overall
        avg_i_speed_h = '<span class="fs-2">' + avg_i_speed.toFixed(2) + ' Km/h</span>'
        avg_speed_h = '<span class="fs-2">' + avg_speed.toFixed(2) + ' Km/h</span>'

        max_speed_h = '<span class="fs-2">' + max_speed.toFixed(2) + ' Km/h</span>'
        max_i_speed_h = '<span class="fs-2">' + max_i_speed.toFixed(2) + ' Km/h</span>'
        //Gliding
        g_avg_i_speed_h = '<span class="fs-2">' + g_avg_i_speed.toFixed(2) + ' Km/h</span>'
        g_avg_speed_h = '<span class="fs-2">' + g_avg_speed.toFixed(2) + ' Km/h</span>'

        g_max_speed_h = '<span class="fs-2">' + g_max_speed.toFixed(2) + ' Km/h</span>'
        g_max_i_speed_h = '<span class="fs-2">' + g_max_i_speed.toFixed(2) + ' Km/h</span>'

        //Thermaling

        t_avg_i_speed_h = '<span class="fs-2">' + t_avg_i_speed.toFixed(2) + ' Km/h</span>'
        t_avg_speed_h = '<span class="fs-2">' + t_avg_speed.toFixed(2) + ' Km/h</span>'

        t_max_speed_h = '<span class="fs-2">' + t_max_speed.toFixed(2) + ' Km/h</span>'
        t_max_i_speed_h = '<span class="fs-2">' + t_max_i_speed.toFixed(2) + ' Km/h</span>'

    }

    $('#avg_oa_i_speed').html(avg_i_speed_h);
    $('#avg_oa_speed').html(avg_speed_h);
    $('#max_oa_speed').html(max_speed_h);
    $('#max_oa_i_speed').html(max_i_speed_h);

    $('#avg_gl_i_speed').html(g_avg_i_speed_h);
    $('#avg_gl_speed').html(g_avg_speed_h);
    $('#max_gl_speed').html(g_max_speed_h);
    $('#max_gl_i_speed').html(g_max_i_speed_h);

    $('#avg_th_i_speed').html(t_avg_i_speed_h);
    $('#avg_th_speed').html(t_avg_speed_h);
    $('#max_th_speed').html(t_max_speed_h);
    $('#max_th_i_speed').html(t_max_i_speed_h);

    $('#sum_ffvl_score').html(sum_ffvl_score);
    $('#max_ffvl_score').html(max_ffvl_score);
    $('#avg_ffvl_score').html(avg_ffvl_score);

    $('#sum_ffvl_dist').html(sum_ffvl_dist);
    $('#max_ffvl_dist').html(max_ffvl_dist);
    $('#avg_ffvl_dist').html(avg_ffvl_dist);

    $('#sum_xc_score').html(sum_xc_score);
    $('#max_xc_score').html(max_xc_score);
    $('#avg_xc_score').html(avg_xc_score);

    $('#avg_xc_dist').html(avg_xc_dist);
    $('#max_xc_dist').html(max_xc_dist);
    $('#sum_xc_dist').html(sum_xc_dist);

    $('#count_badge').html(count);
    $('#air_badge').html(duration);
    $('#alti_GPS_badge').html(alti_gps);
    $('#alti_Baro_badge').html(alti_baro);

    $('#max_dist').html(max_dist);
    $('#avg_dist').html(avg_dist);
    $('#sum_dist').html(sum_dist);

    $('#max_vario').html(max_vario_h);
    $('#min_vario').html(min_vario_h);

    $('#i_max_vario').html(max_vario_i_h);
    $('#i_min_vario').html(min_vario_i_h);

    $('#trace_length').html(sum_trace);
}

function redrawViz(filteredData) {
    redrawTable(filteredData)
    redrawBadges(filteredData)
}

function getFlightRepr(flight, appliedFilters) {
    repr = "";
    if (appliedFilters[0]) {
        repr += flight.wing;
    }
    if (appliedFilters[1]) {
        repr += flight.year;
    }
    if (appliedFilters[2]) {
        repr += flight.site;
    }
    return repr;
}

function applyFilters(allData, appliedFilters, filterStrings) {
    var filterRepr = filterStrings.join('');

    filteredData = [];
    allData.forEach((flight, i) => {
        if (getFlightRepr(flight, appliedFilters) == filterRepr) {
            filteredData.push(flight);
        }
    });
    return filteredData;
}