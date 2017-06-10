
// _.each($('body.test'), function(v){
//   _.each($(v).find('.prac'), __(
//     $,
//     _('on', 'click', (prac)=>{
//       // $(prac).find('p').on('click', function(event){
//       //   console.log(event.data)
//       // })
//     }),
//     _('on', 'click', 'p', (event)=>{
//       console.log(event.target)
//       console.log(event.delegateTarget)
//       event.preventDefault();
//       console.log(event.currentTarget)
//       console.log(event.relatedTarget)
//     })
//   ))
// });

// var a;
// var d= [];
// _.defer(()=>a = _.go($('div.card'), _.reduce((m,v, i)=>{
//   if((i+1)%3 == 1) d=[];
//   d.push($(v).height());
//   if((i+1)%3 == 0) {
//     m.push(d);
//   }
//   return m;
// }, [])));





_.each($('body.card'), __(
  $,
  _.all(function(card) {

    // function show_cards(n){
    // _.defer(()=>_.reduce($('div.card'), (m, v, i)=>{
    //   if(i%n == 0 && i != 0) {
    //     m.left = 0;
    //     m.splice(0,n);
    //     m = _.sortBy(m, 'top');
    //   }
    //   $(v).css({transform: 'translate('+ m[i%n].left+'px, '+ m[i%n].top+'px)'});
    //   // $(v).one('transition', function(){
    //     var res = $(v).position().top+ $(v).height();
    //     return m.concat({left : m[i%n].left, top:res});
    //   // })
    //   }, _.go(_.range(n-1), _.reduce((m,v)=>{ return m.concat({left: m[v].left+270, top: 0})}, [{left: 0, top: 0}]))
    // ));
    // }

    $.post('/api/cards', function(abc){
      _.each(abc, (v)=>{

        _.go(_.t('img', '\
          .card\
            img[src={{img}}]\
        ')(v.img), $, (v)=>{$('.card_main').append(v)})
      })
      var window_size = $(window).width();
      if(window_size > 500 && window_size <= 800) {show_cards(2, 'div.card', true);
      }
      else if(window_size > 800 && window_size <= 1100) {show_cards(3, 'div.card', true);
      }
      else if(window_size > 1100 && window_size <= 1400) {show_cards(4, 'div.card', true);
      }
      else if(window_size > 1400) {show_cards(5, 'div.card', true);
      }
    });

    var total;
    var arr;
    function show_cards (n, target, bb) {
      total = []
      arr = Array(n);
      _.defer(()=> {
        _.each($(target), (v, i)=> {
          if (i < n) {
            arr[i] = {top : $(v).height() + 10, left: 260 * i};
            total[i] = {top : 0, left : 260 *i}
          }
          if (i>=n){
            arr = _.sortBy(arr, 'top')
            total.push(_.clone(arr[0]));
            arr[0] = _.extend(arr[0], {top :arr[0].top + $(v).height() +10})
          }
        })
        _.each($(target), (v, i)=>{
          $(v).css({transform: 'translate('+ total[i].left +'px, '+ total[i].top +'px)'})
        });
        $('.card_main').css('visibility', 'visible')
        if(!bb)$(target).css('transition', '0.2s')
      });
    }

    // function show_cards2 (n, target) {
    //     _.each(target, (v, i)=> {
    //         arr = _.sortBy(arr, 'top')
    //         total.push(_.clone(arr[0]));
    //         _.extend(arr[0], {top :arr[0].top + $(v).height() +10})
    //     })
    //     _.each(target, (v, i)=>{
    //       $(v).css({transform: 'translate('+ total[i+6].left +'px, '+ total[i+6].top +'px)'})
    //     });
    //     $('.card_main').css('visibility', 'visible')
    //     _.defer(()=>$('div.card').css('transition', '0.2s'))
    // }
    var a = _.throttle(()=>$.post('/api/cards', function(abc){
      _.each(abc, (v)=>{
        _.go(_.t('img', '\
          .card[class=new]\
            img[src={{img}}]\
        ')(v.img), $, (v)=>$(v).appendTo('.card_main'))

      })
      show_cards(arr.length, 'div.card');

    }), 100, {trailing: false});
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        a();
      }
    });

    $(window).resize(_.debounce(function() {
      var window_size = $(window).width();
      if(window_size > 500 && window_size <= 800) show_cards(2, 'div.card');
      else if(window_size > 800 && window_size <= 1100) show_cards(3, 'div.card');
      else if(window_size > 1100 && window_size <= 1400) show_cards(4, 'div.card');
      else if(window_size > 1400) show_cards(5, 'div.card');
    }, 200, 'div.card'))

  })
));



//
// $('div.card').eq(0).css({
//   transform: 'translateX(300px)'
// });