$(function () {

// 崩溃率折线图
var lineCrash = echarts.init(document.getElementById("echarts-line-crash-chart"));
    
    var table_title = '技术平台应用崩溃率'
    var app_name = ['推送服务','Flyme账号','桌面云备份','数据云同步','Flyme整体']
    var month = ['2017-11','2017-12','2018-01']
    var MzCloudService_crash_data = [0.03,0.2,0.06]
    var MzAccount_crash_data = [0.14,0.15,0.19,0.18]
    var DeskTop_Backup_crash_data = [2.24,0.48,0.66]
    var MzSyncService_crash_data = [0.04,0.05,0.03]
    var Flyme_crash_data = [0.48,0.44,0.27]

    var crashLineOption = {
        

        title: {
        text: ''
    },
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    legend: {
        data:app_name
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : month
        }
    ],
    yAxis : [
        {
            type : 'value',
            min:0,
            max:1
        }
    ],
    series : [
        {
            name:app_name[0],
            type:'line',
            label:{ 
                normal:{ 
                show: true, 
                position: 'top'} 
            },
       
            areaStyle: {normal: {}},
            data:MzCloudService_crash_data
        },
        {
            name:app_name[1],
            type:'line',
            label:{ 
                normal:{ 
                show: true, 
                position: 'top'} 
            },
         
            areaStyle: {normal: {}},
            data:MzAccount_crash_data
        },
        {
            name:app_name[2],
            type:'line',
            label:{ 
                normal:{ 
                show: true, 
                position: 'top'} 
            },
           
            areaStyle: {normal: {}},
            data:DeskTop_Backup_crash_data
        },
        {
            name:app_name[3],
            type:'line',
            label:{ 
                normal:{ 
                show: true, 
                position: 'top'} 
            },
       
            areaStyle: {normal: {}},
            data:MzSyncService_crash_data
        },
        {
            name:app_name[4],
            type:'line',
            label:{ 
                normal:{ 
                show: true, 
                position: 'top'} 
            },
            
            areaStyle: {normal: {}},
            data:Flyme_crash_data
        }
    ]
    };

    lineCrash.setOption(crashLineOption);
    $(window).resize(lineCrash.resize);

    //崩溃率柱状图
    var barCrash = echarts.init(document.getElementById("echarts-bar-crash-chart"));

    var crashBarOption = {
        

            title: {
                text: ''
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data:app_name
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : month
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    min:0,
                    max:1
                    // axisLabel:{
                    // formatter: function (value) {
                    //     var texts = [];
                    //     if (value <= 0.2) {
                    //         texts.push('好');
                    //     }
                    //     return texts;
                    //     }
                    // }
                }
            ],
            series : [
                {
                    name:app_name[0],
                    type:'bar',
                    label:{ 
                        normal:{ 
                        show: true, 
                        position: 'top'} 
                    },
               
                    areaStyle: {normal: {}},
                    data:MzCloudService_crash_data
                },
                {
                    name:app_name[1],
                    type:'bar',
                    label:{ 
                        normal:{ 
                        show: true, 
                        position: 'top'} 
                    },
                 
                    areaStyle: {normal: {}},
                    data:MzAccount_crash_data
                },
                {
                    name:app_name[2],
                    type:'bar',
                    label:{ 
                        normal:{ 
                        show: true, 
                        position: 'top'} 
                    },
                   
                    areaStyle: {normal: {}},
                    data:DeskTop_Backup_crash_data
                },
                {
                    name:app_name[3],
                    type:'bar',
                    label:{ 
                        normal:{ 
                        show: true, 
                        position: 'top'} 
                    },
               
                    areaStyle: {normal: {}},
                    data:MzSyncService_crash_data
                },
                {
                    name:app_name[4],
                    type:'line',
                    label:{ 
                        normal:{ 
                        show: true, 
                        position: 'top'} 
                    },
                    
                    areaStyle: {normal: {}},
                    data:Flyme_crash_data
                }
            ]
    };

    barCrash.setOption(crashBarOption);
    $(window).resize(barCrash.resize);


    var serious_bug_standard = [95,95,95]
    var all_bug_stardard = [80,80,80]

//严重bug修复率
    var barseriousBugChart = echarts.init(document.getElementById("echarts-serious-bug-bar-chart"));

    var table_serious_bug_title = '严重Bug修复率'
    var app_name = ['推送服务','Flyme账号','桌面云备份','数据云同步','标准']
    var month = ['2017-11','2017-12','2018-01']
    var MzCloudService_serious_bug_data = [88.9,100,90]
    var MzAccount_serious_bug_data = [89.1,93.5,92.4]
    var DeskTop_Backup_serious_bug_data = [96.7,98.9,97.9]
    var MzSyncService_serious_bug_data = [69,80,77.9]

    var barseriousBugoption = {
        title: {
        text: ''
    },
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    legend: {
        data:app_name
    },
    toolbox: {
       feature: {
         saveAsImage: {}
       }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : month
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:app_name[0],
            type:'bar',
            label:{ 
                normal:{ 
                   show: true, 
                   position: 'inside'} 
            },
       
            areaStyle: {normal: {}},
            data:MzCloudService_serious_bug_data
        },
        {
            name:app_name[1],
            type:'bar',
            label:{ 
                normal:{ 
                    show: true, 
                    position: 'inside'} 
            },
         
            areaStyle: {normal: {}},
            data:MzAccount_serious_bug_data
        },
        {
            name:app_name[2],
            type:'bar',
            label:{ 
                normal:{ 
                    show: true, 
                    position: 'inside'} 
            },
           
            areaStyle: {normal: {}},
            data:DeskTop_Backup_serious_bug_data
        },
        {
            name:app_name[3],
            type:'bar',
            label:{ 
                    normal:{ 
                    show: true, 
                    position: 'inside'} 
            },
       
            areaStyle: {normal: {}},
            data:MzSyncService_serious_bug_data
        },
        {
            name:app_name[4],
            type:'bar',
            label:{ 
                    normal:{ 
                    show: true, 
                    position: 'inside'} 
            },
       
            areaStyle: {normal: {}},
            data:serious_bug_standard
        }
    ]
    };
    barseriousBugChart.setOption(barseriousBugoption);

    window.onresize = barseriousBugChart.resize;

    // 整体bug修复率
    var barallBugChart = echarts.init(document.getElementById("echarts-all-bug-bar-chart"));
    
    var table_allbug_title = '整体Bug修复率'
    var app_name = ['推送服务','Flyme账号','桌面云备份','数据云同步','标准']
    var month = ['2017-11','2017-12','2018-01']
    var MzCloudService_all_bug_data = [92.3,95.3,95.5]
    var MzAccount_all_bug_data = [86.1,87.7,86.6]
    var DeskTop_Backup_all_bug_data = [91.7,93.1,94.8]
    var MzSyncService_all_bug_data = [65.2,69.8,69]

    var lineAllbugoption = {
        

            title: {
                text: ''
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data:app_name
            },
            toolbox: {
               feature: {
                 saveAsImage: {}
               }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : month
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:app_name[0],
                    type:'bar',
                    label:{ 
                        normal:{ 
                            show: true, 
                            position: 'top'} 
                    },            
               
                    areaStyle: {normal: {}},
                    data:MzCloudService_all_bug_data
                },
                {
                    name:app_name[1],
                    type:'bar',
                    label:{ 
                        normal:{ 
                            show: true, 
                            position: 'top'} 
                    }, 
                    areaStyle: {normal: {}},
                    data:MzAccount_all_bug_data
                },
                {
                    name:app_name[2],
                    type:'bar',
                    label:{ 
                        normal:{ 
                            show: true, 
                            position: 'top'} 
                    }, 
                    areaStyle: {normal: {}},
                    data:DeskTop_Backup_all_bug_data
                },
                {
                    name:app_name[3],
                    type:'bar',
                    label:{ 
                        normal:{ 
                            show: true, 
                            position: 'top'} 
                    }, 

                    areaStyle: {normal: {}},
                    data:MzSyncService_all_bug_data
                },
                {
                    name:app_name[4],
                    type:'bar',
                    label:{ 
                        normal:{ 
                            show: true, 
                            position: 'top'} 
                    }, 
                    areaStyle: {normal: {}},
                    data:all_bug_stardard
                }
            ]
    };

    barallBugChart.setOption(lineAllbugoption);
    $(window).resize(barallBugChart.resize);

});
