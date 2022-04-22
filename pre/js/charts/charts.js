//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42',
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0',
COLOR_GREY_1 = '#D6D6D6', 
COLOR_GREY_2 = '#A3A3A3',
COLOR_ANAG__PRIM_1 = '#BA9D5F', 
COLOR_ANAG_PRIM_2 = '#9E6C51',
COLOR_ANAG_PRIM_3 = '#9E3515',
COLOR_ANAG_COMP_1 = '#1C5A5E';

export function initChart(iframe) {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_10/main/data/distribucion_enfermedades_espana_relativo.csv', function(error,data) {
        if (error) throw error;

        data = data.filter(function(item) { if(item.Edad != 'Todas las edades'){ return item; } });

        //Declaramos fuera las variables genéricas
        let margin = {top: 20, right: 20, bottom: 40, left: 35},
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

        let gruposEnfermedadesMujeres = ['causas_externas_mujeres','circulatorio_mujeres','respiratorio_mujeres','parasitarias_mujeres','tumores_mujeres','otros_mujeres'];
        let gruposEnfermedadesHombres = ['causas_externas_hombres','circulatorio_hombres','respiratorio_hombres','parasitarias_hombres','tumores_hombres','otros_hombres'];

        
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

        chart1.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));

        chart2.append("g")
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));

        //Colores
        let colorMujeres = d3.scaleOrdinal()
            .domain(gruposEnfermedadesMujeres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_GREY_1, COLOR_GREY_2, COLOR_OTHER_1]);

        let colorHombres = d3.scaleOrdinal()
            .domain(gruposEnfermedadesHombres)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_GREY_1, COLOR_GREY_2, COLOR_OTHER_1]);

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
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                    .attr('class','prueba-1')
                    .attr("x", function(d) { return x(d.data.Edad); })
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return 0; })
                    .attr("width",x.bandwidth())
                    .transition()
                    .duration(2500)
                    .attr("y", function(d) { return y(d[1]); })
                    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

            chart2.append("g")
                .attr('class','chart-g-2')
                .selectAll("g")
                .data(dataStackedWomen)
                .enter()
                .append("g")
                .attr("fill", function(d) { return colorMujeres(d.key); })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter()
                .append("rect")
                    .attr('class','prueba-2')
                    .attr("x", function(d) { return x(d.data.Edad); })
                    .attr("y", function(d) { return y(0); })
                    .attr("height", function(d) { return 0; })
                    .attr("width",x.bandwidth())
                    .transition()
                    .duration(2500)
                    .attr("y", function(d) { return y(d[1]); })
                    .attr("height", function(d) { return y(d[0]) - y(d[1]); });
        }

        function animateChart() {

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