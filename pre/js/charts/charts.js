//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas3 } from '../helpers';
import { getInTooltip, getOutTooltip, positionTooltip } from '../modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C',
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0',
COLOR_GREY_1 = '#D6D6D6',
COLOR_ANAG_PRIM_1 = '#BA9D5F',
COLOR_ANAG_COMP_1 = '#1C5A5E';
let tooltip = d3.select('#tooltip');

//Diccionario
let dictionary = {
    causasexternas: 'Causas externas',
    circulatorio: 'Enfermedades sist. circulatorio',
    respiratorio: 'Enfermedades sist. respiratorio',
    parasitarias: 'Enfermedades infecciosas',
    tumores: 'Tumores',
    otros: 'Otras causas'
}

export function initChart(iframe) {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_10/main/data/distribucion_enfermedades_espana_relativo.csv', function(error,data) {
        if (error) throw error;

        data = data.filter(function(item) { if(item.Edad != 'Todas las edades'){ return item; } });

        //Declaramos fuera las variables genéricas
        let margin = {top: 10, right: 10, bottom: 40, left: 32.5},
            width = document.getElementById('bars--first').clientWidth - margin.left - margin.right,
            height = document.getElementById('bars--first').clientHeight - margin.top - margin.bottom;

        let chart1 = d3.select("#bars--first")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let chart2 = d3.select("#bars--second")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let gruposEnfermedadesMujeres = ['causasexternas_mujeres','circulatorio_mujeres','respiratorio_mujeres','parasitarias_mujeres','tumores_mujeres','otros_mujeres'];
        let gruposEnfermedadesHombres = ['causasexternas_hombres','circulatorio_hombres','respiratorio_hombres','parasitarias_hombres','tumores_hombres','otros_hombres'];
        
        //Eje X
        let x = d3.scaleBand()
            .domain(d3.map(data, function(d){ return d.Edad; }).keys())
            .range([0, width])
            .padding([0.2]);

        let xAxis = function(g) {
            g.call(d3.axisBottom(x).tickValues(x.domain().filter(function(d,i){ return !(i%2); })));
            g.call(function(svg) {
                svg.selectAll("text")  
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");
            });
            
            g.call(function(g){g.selectAll('.tick line').remove()});
            g.call(function(g){g.select('.domain').remove()});
        }
        
        chart1.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        chart2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Eje Y
        let y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        let yAxis = function(g) {
            g.call(d3.axisLeft(y).ticks(5));
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 0) {
                        return 'line-special';
                    }
                })
                .attr('x1', '0')
                .attr('x2', `${width}`);
        }

        chart1.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        chart2.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        //Colores
        let colorMujeres = d3.scaleOrdinal()
            .domain(gruposEnfermedadesMujeres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_ANAG_COMP_1, COLOR_ANAG_PRIM_1, COLOR_GREY_1]);

        let colorHombres = d3.scaleOrdinal()
            .domain(gruposEnfermedadesHombres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_ANAG_COMP_1, COLOR_ANAG_PRIM_1, COLOR_GREY_1]);

        let dataStackedWomen = d3.stack()
            .keys(gruposEnfermedadesMujeres)
            (data);
    
        let dataStackedMen = d3.stack()
            .keys(gruposEnfermedadesHombres)
            (data);        
        
        function init() {
            chart1.append("g")
                .attr('class','chart-g-1')
                .selectAll("g")
                .data(dataStackedMen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorHombres(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-1 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class', 'rect-1')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.${current.split('_')[0]}_hombres`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.${current.split('_')[0]}_mujeres`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });
                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Tipo: ' + dictionary[current.split('_')[0]] + '</p>' + 
                        '<p class="chart__tooltip--text">El <b>' + numberWithCommas3(parseFloat(d.data[current]).toFixed(1)) + '%</b> de los hombres de este grupo de edad (' + d.data.Edad + ') fallecieron por este tipo de causa</p>';
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);

                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });

            chart2.append("g")
                .attr('class','chart-g-2')
                .selectAll("g")
                .data(dataStackedWomen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorMujeres(d.key); })
                .attr('class', function(d) {
                    return 'rect-padre-2 ' + d.key;
                })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                .attr('class','rect-2')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .on('mouseover', function(d,i,e) {
                    //Opacidad de las barras
                    let current = this.parentNode.classList[1];
                    let other_1 = chart1.selectAll('.rect-1');
                    let other_2 = chart2.selectAll('.rect-2');
                    let _this_1 = chart1.selectAll(`.${current.split('_')[0]}_hombres`); //Elemento padre
                    let _thisChilds_1 = _this_1.selectAll('.rect-1');
                    let _this_2 = chart2.selectAll(`.${current.split('_')[0]}_mujeres`); //Elemento padre
                    let _thisChilds_2 = _this_2.selectAll('.rect-2');
                    
                    other_1.each(function() {
                        this.style.opacity = '0.2';
                    });
                    other_2.each(function() {
                        this.style.opacity = '0.2';
                    });
                    _thisChilds_1.each(function() {
                        this.style.opacity = '1';
                    });
                    _thisChilds_2.each(function() {
                        this.style.opacity = '1';
                    });

                    //Texto                    
                    let html = '<p class="chart__tooltip--title">Tipo: ' + dictionary[current.split('_')[0]] + '</p>' + 
                        '<p class="chart__tooltip--text">El <b>' + numberWithCommas3(parseFloat(d.data[current]).toFixed(1)) + '%</b> de las mujeres de este grupo de edad (' + d.data.Edad + ') fallecieron por este tipo de causa</p>';
            
                    tooltip.html(html);

                    //Tooltip
                    positionTooltip(window.event, tooltip);
                    getInTooltip(tooltip);
                })
                .on('mouseout', function(d,i,e) {
                    //Quitamos los estilos de la línea
                    let bars_1 = chart1.selectAll('.rect-1');
                    let bars_2 = chart2.selectAll('.rect-2');
                    bars_1.each(function() {
                        this.style.opacity = '1';
                    });
                    bars_2.each(function() {
                        this.style.opacity = '1';
                    });
                
                    //Quitamos el tooltip
                    getOutTooltip(tooltip); 
                })
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        function animateChart() {
            chart1.selectAll('.rect-1')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });

            chart2.selectAll('.rect-2')
                .attr("x", function(d) { return x(d.data.Edad); })
                .attr("y", function(d) { return y(0); })
                .attr("height", function(d) { return 0; })
                .attr("width",x.bandwidth())
                .transition()
                .duration(2000)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        /////
        /////
        // Resto - Chart
        /////
        /////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        /////
        /////
        // Resto
        /////
        /////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_salud_2_10','distribucion_porc_muertes_sexo');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('distribucion_porc_muertes_sexo');

        //Captura de pantalla de la visualización
        setChartCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('distribucion_porc_muertes_sexo');
        });

        //Altura del frame
        setChartHeight(iframe);
    });    
}