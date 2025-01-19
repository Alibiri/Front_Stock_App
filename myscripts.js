    // Formatting function for row details - modify as you need
    function format(d) {
        // `d` is the original data object for the row
            return (
                '<dl>' +
                '<dt>Activity Logs:</dt>' +
                '<dd>' +
                d.isActive +
                '</dd>' +
                '<dt>Phone number:</dt>' +
                '<dd>' +
                d.phone +
                '</dd>' +
                '<dt>Full Address:</dt>' +
                '<dd>' +
                d.address +
                '<dt>Email:</dt>' +
                '<dd>' +
                d.email +
                '<dt>Extra info:</dt>' +
                '<dd>' +
                d.about +
                '</dd>' +
                '</dl>'
            );
        }

    $(document).ready(function() {
    var table = $('#dataTable').DataTable({
        ajax: "generated.json",
        dataType:"json",
        processing: true,
        serverSide: false,
        success: function (data) {
            try {
                validateData(data);
                renderTable(data);
            } catch (err) {
                console.error("Validation or rendering error:", err.message);
                alert("Data validation or rendering failed. please check the JSON file.");
            }
        },
        error: function (xhr, status, error){
            console.error("Failed to fetch JSON:", error);
            alert("Unable to load data. Please check the file path or the server.");
        },
        columns: [
            {   
                className:'dt-control',
                orderable: false,
                data:null,
                defaultContent:'',
                
            },
            {"data":"name"},
            {"data":"age"},
            {"data":"gender"},
            {"data":"eyeColor"},
            {"data":"company"},
            {"data":"balance"},
        ],
        responsive: true,
        paging: true,
        searching: true,
        language: {
            emptyTable: "No data available in table",
        },
        "order": [[1, 'asc']],

        layout: {
            topStart: {
                buttons: ['copy', 'excel', 'pdf', 'colvis']
                },

        }       
    });

    //  Validation Test
    function validateData(data) {
        if (!data.every(item => item._id && item.name && item.email)) {
            throw new Error("Data format validation failed.");
        }
    }

    // Rendering Test
    function renderTable(data) {
        if (!Array.isArray(data)) {
            throw new Error("Invalid data format: Expected an array.");
        }
    }    

    // Add event listener for opening and closing details
    table.on('click', 'td.dt-control', function (e) {
    let tr = e.target.closest('tr');
    let row = table.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
        }
        else {
            // Open this row
            row.child(format(row.data())).show();
        }
    });

    // Filtering function based on age and gender
    function filterTable() {
        var ageLimit = $('#ageRange').val();
        var selectedGender = $('#genderSelect').val();

        // Clear any existing filters to avoid stacking
        $.fn.dataTable.ext.search = [];

        // Add the combined filter
        $.fn.dataTable.ext.search.push(function(settings, data) {
            var age = parseFloat(data[2]) || 0; // '2' is the index of age column
            var gender = data[3]; // '3' is the index of gender column

            var ageMatch = age <= ageLimit;
            var genderMatch = selectedGender === "" || gender === selectedGender;

            return ageMatch && genderMatch;
        });

        table.draw();
    }

        // Attach events
        $('#ageRange').on('input', function() {
        $('#ageValue').text($(this).val());
        filterTable();
        });

        $('#genderSelect').on('change', function() {
        filterTable();
        });

        // Create chart
        const chart = Highcharts.chart('demo-output', {
            chart: {
                type: 'pie',
                styledMode: true
            },
            title: {
                text: 'People eye color chart'
            },
            series: [
                {
                    data: chartData(table)
                }
        ]
});

        // On each draw, update the data in the chart
        table.on('draw', function () {
            chart.series[0].setData(chartData(table));
        });

        function chartData(table) {
            var counts = {};

        // Count the number of entries for each position
        table
        .column(4, { search: 'applied' })
        .data()
        .each(function (val) {
            if (counts[val]) {
                counts[val] += 1;
            }
            else {
                counts[val] = 1;
            }
        });
        return Object.entries(counts).map((e) => ({
        name: e[0],
        y: e[1]
    }));
}
});


