$(function() {
    let $age_wise = $('#first-graph-table tbody');
    let $_age = $('#age-group');
    let $_all = $('#all-in-age-group');
    let $_males = $('#males-in-age-group');
    let $_females = $('#females-in-age-group');
    let $add_button = $('#add-row-button');
    
    let first_Graph_Template = "<tr><td> {{_age}} </td>"+
        "<td>{{_all}}</td>"+
        "<td>{{_males}}</td>"+
        "<td>{{_females}}</td>"+
        "<td><input data-id='{{id}}_edit' type='button' class='btn btn-info' value='Edit'> "+
        "<input data-id='{{id}}' type='button' class='btn btn-danger' value='Remove'></td></tr>";
    
    function append_first_graph(newData){
        $age_wise.append(Mustache.render(first_Graph_Template, newData));
    }
    
   $.ajax({
       type: 'GET',
       url: '/age_wise_data',
       dataType: "json",
       success: function(data){
           $.each(data, function(i, age_det){
               $age_wise.append(Mustache.render(first_Graph_Template, age_det));
                });
       }
   }); 
    
    
    $('#add-row-button').on('click', function(){
        
        if( $_age.val() == "" || $_all.val() == "" || $_males.val() =="" ||$_females.val() == ""){
            alert("some missing values here!");
        }    
        else{
            var age_details = {
            _age: $_age.val(),
            _all: $_all.val(),
            _males: $_males.val(),
            _females: $_females.val()
                };
        
        $.ajax({
            type: 'POST',
            url: '/age_wise_data',
            data: age_details,
            dataType: "json",
            success: function(newData){
                append_first_graph(newData);
                },
            error: function(){
                alert('values already exists, please edit instead');
            }
           
            });
        }
    });
    
    $age_wise.delegate('.btn-danger','click', function(){
        let $tr = $(this).closest('tr');
        $.ajax({
        type:'DELETE',
        url: '/age_wise_data/' + $(this).attr('data-id'),
            success: function(){
                $tr.fadeOut(300, function(){
                    $(this).remove();
                })
            }
        });
        
    })
    
    
    
    
    
    $.ajax({
       type: 'GET',
       url: '/graduates_data',
       success: function(data){
           console.log('success',data);
       }
   }) 
    $.ajax({
       type: 'GET',
       url: '/literates_data',
       success: function(data){
           console.log('success',data);
       }
   }) 
});