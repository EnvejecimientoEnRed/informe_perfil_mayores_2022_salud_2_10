//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_salud_2_10/main/data/distribucion_defunciones_reducida_v3.csv', function(error,data) {
        if (error) throw error;

        data = data.filter(function(item) { if(item.Edad != 'Todas las edades'){ return item; } });

        //Declaramos fuera las variables genéricas
        let margin = {top: 20, right: 20, bottom: 20, left: 35},
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

        let gruposEnfermedades = ['Causas externas de mortalidad','Enfermedades del sistema circulatorio','Enfermedades del sistema respiratorio','Enfermedades infecciosas y parasitarias *','Tumores','Otras causas'];

        //Eje X
        let x = d3.scaleBand()
            .domain(d3.map(data, function(d){ return d.Edad; }).keys())
            .range([0, width])
            .padding([0.2]);

        let xAxis = d3.axisBottom(x)
            .tickValues(x.domain().filter(function(d,i){ return !(i%2)}));
        
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
        let color = d3.scaleOrdinal()
            .domain(gruposEnfermedades)
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_GREY_1, COLOR_GREY_2, COLOR_OTHER_1]);

        let dataStacked = d3.stack()
            .keys(gruposEnfermedades)
            (data);

        console.log(dataStacked);
        
        
        function init() {

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
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('distribucion_porc_muertes_sexo');
            setChartCustomCanvasImage('distribucion_porc_muertes_sexo');
        });

        //Altura del frame
        setChartHeight(iframe);
    });    
}