openerp.pos_return = function (instance) {
    var _t = instance.web._t;
    var QWeb = instance.web.qweb;
    
    var round_di = instance.web.round_decimals;
    var round_pr = instance.web.round_precision;
    
    instance.point_of_sale.ProductScreenWidget = instance.point_of_sale.ProductScreenWidget.extend({
        init: function() {
            this._super.apply(this, arguments);
        },
        start:function(){
            var self = this;
            this._super();
            
            pos = self.pos;
            selectedOrder = self.pos.get('selectedOrder');
            $('#return_order_ref').html('');
            pos = pos;
            
            $("span#return_order").click(function() {
                $("span#return_order").css('background', 'blue');
                $("span#sale_mode").css('background', '');
                $("span#missing_return_order").css('background', '');
                selectedOrder = pos.get('selectedOrder');
                selectedOrder.set_sale_mode(false);
                selectedOrder.set_missing_mode(false);
                dialog = new instance.web.Dialog(this, {
                    title: _t("Return Order"),
                    size: 'small',
                    buttons: [
                        {text: _t("Validate"), click: function() {
                            var ret_o_ref = dialog.$el.find("input#return_order_number").val();
                            if (ret_o_ref.indexOf('Order') == -1) {
                                ret_o_ref_order = _t('Order ') + ret_o_ref.toString();
                            }
                            if (ret_o_ref.length > 0) {
                                new instance.web.Model("pos.order").get_func("search_read")
                                            ([['pos_reference', '=', ret_o_ref_order]], 
                                            ['id', 'pos_reference', 'partner_id']).pipe(
                                    function(result) {
                                        if (result && result.length == 1) {
                                            new instance.web.Model("pos.order.line").get_func("search_read")
                                                    ([['order_id', '=', result[0].id],['return_qty', '>', 0]]).pipe(
                                            function(res) {
                                                if (res) {
                                                    products = [];
                                                    _.each(res,function(r) {
                                                        product = pos.db.get_product_by_id(r.product_id[0]);
                                                        products.push(product)
                                                    });
                                                    self.product_list_widget.set_product_list(products);
                                                }
                                            });
                                            selectedOrder.set_ret_o_id(result[0].id);
                                            selectedOrder.set_ret_o_ref(result[0].pos_reference);
                                            $('#return_order_ref').html(result[0].pos_reference);
                                            if (result[0].partner_id) {
                                                var partner = pos.db.get_partner_by_id(result[0].partner_id[0]);
                                                selectedOrder.set_client(partner);
                                            }
                                        } else {
                                            var error_str = _t('Please enter correct reference number !');
                                            var error_dialog = new instance.web.Dialog(this, { 
                                                size: 'small',
                                                buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                                            }).open();
                                            error_dialog.$el.append(
                                                '<span id="error_str" style="font-size:16px;">' + error_str + '</span>');
                                        }
                                    }
                                );
                                this.parents('.modal').modal('hide');
                            } else {
                                var error_str =_t('Order number can not be empty !');
                                var error_dialog = new instance.web.Dialog(this, { 
                                    size: 'small',
                                    buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                                }).open();
                                error_dialog.$el.append(
                                    '<span id="error_str" style="font-size:18px;">' + error_str + '</span>');
                            }
                        }},
                        {text: _t("Cancel"), click: function() { 
                            $("span#return_order").css('background', '');
                            $("span#sale_mode").css('background', 'blue');
                            $("span#missing_return_order").css('background', '');
                            this.parents('.modal').modal('hide'); 
                            $("span.remaining-qty-tag").css('display', 'none');
                        }}
                    ]
                }).open();
                dialog.$el.html(QWeb.render("pos-return-order", self));
                dialog.$el.find("input#return_order_number").focus();
                dialog.$el.find("input#return_order_number").keypress(function(event) {
                    if (event.which == 13) {
                        event.preventDefault();
                        $('.oe_form_button').trigger('click');
                    }
                });
            });
            
            $("span#sale_mode").click(function(event) {
                var selectedOrder = pos.get('selectedOrder');
                var id = $(event.target).data("category-id");
                selectedOrder.set_ret_o_id('');
                selectedOrder.set_sale_mode(true);
                selectedOrder.set_missing_mode(false);
                var category = pos.db.get_category_by_id(id);
                self.product_categories_widget.set_category(category);
                self.product_categories_widget.renderElement();
                
                $("span#sale_mode").css('background', 'blue');
                $("span#return_order").css('background', '');
                $("span#missing_return_order").css('background', '');
                selectedOrder.set_ret_o_ref('');
                $('#return_order_ref').html('');
                $("span.remaining-qty-tag").css('display', 'none');
            });
            
            $("span#missing_return_order").click(function(event) {
                var selectedOrder = pos.get('selectedOrder');
                var id = $(event.target).data("category-id");
                selectedOrder.set_ret_o_id('Missing Receipt');
                selectedOrder.set_sale_mode(false);
                selectedOrder.set_missing_mode(true);
                var category = pos.db.get_category_by_id(id);
                self.product_categories_widget.set_category(category);
                self.product_categories_widget.renderElement();
                
                $("span#sale_mode").css('background', '');
                $("span#return_order").css('background', '');
                $("span#missing_return_order").css('background', 'blue');
                selectedOrder.set_ret_o_ref('Missing Receipt');
                $('#return_order_ref').html('Missing Receipt');
                $("span.remaining-qty-tag").css('display', 'none');
            });
        },
    });

    instance.point_of_sale.ReceiptScreenWidget = instance.point_of_sale.ReceiptScreenWidget.extend({
        show: function(){
            this._super();
            var self = this;

            var barcode_val = this.pos.get('selectedOrder').getName();
            if (barcode_val.indexOf(_t("Order ")) != -1) {
                var vals = barcode_val.split(_t("Order "));
                if (vals) {
                    barcode = vals[1];
                    $("tr#barcode1").html($("<td style='padding:2px 2px 2px 0px; text-align:center;'><div class='" + barcode + "' width='150' height='50'/></td>"));
                    $("." + barcode.toString()).barcode(barcode.toString(), "code128");
                }
            }
        },
        finishOrder: function() {
            this._super();
            this.pos.get('selectedOrder').set_ret_o_id('')
            this.pos.get('selectedOrder').destroy();
            this.pos.get('selectedOrder').set_sale_mode(false);
            this.pos.get('selectedOrder').set_missing_mode(false);
            $("span#sale_mode").css('background', 'blue');
            $("span#return_order").css('background', '');
            $("span#missing_return_order").css('background', '');
            $('#return_order_ref').html('');
            $('#return_order_number').val('');
            $("span.remaining-qty-tag").css('display', 'none');
        }
    });
    
    var orderline_id = 1;
    
    var _super_orderline = instance.point_of_sale.Orderline.prototype;
    instance.point_of_sale.Orderline = instance.point_of_sale.Orderline.extend({
        initialize: function(attr,options){
            this.oid = null;
            this.backorder = null;
            _super_orderline.initialize.call(this, attr, options);
        },
        set_quantity: function(quantity){
            if(quantity === 'remove'){
                this.set_oid('');
                this.pos.get('selectedOrder').removeOrderline(this);
                return;
            }else{
                _super_orderline.set_quantity.call(this, quantity);
            }
            this.trigger('change',this);
        },
        export_as_JSON: function() {
            var lines = _super_orderline.export_as_JSON.call(this);
            var oid = this.get_oid();
            var return_process = oid;
            var return_qty = this.get_quantity();
            
            var order_ref = this.pos.get('selectedOrder').get_ret_o_id();
            new_val = {
                return_process: return_process,
                return_qty: parseInt(return_qty),
                back_order: this.get_back_order()
            }
            $.extend(lines, new_val);
            return lines;
        },
        set_oid: function(oid) {
            this.set('oid', oid)
        },
        get_oid: function() {
            return this.get('oid');
        },
        set_back_order: function(backorder) {
            this.set('backorder', backorder);
        },
        get_back_order: function() {
            return this.get('backorder');
        },
        can_be_merged_with: function(orderline){
            var merged_lines = _super_orderline.can_be_merged_with.call(this, orderline);
            if(this.get_oid() && this.pos.get('selectedOrder').get_sale_mode()) {
                return false;
            } else if ((this.get_oid() != orderline.get_oid()) && 
                            (this.get_product().id == orderline.get_product().id)) {
                return false;
            }
            return merged_lines;
        },
        merge: function(orderline){
            if (this.get_oid() || this.pos.get('selectedOrder').get_missing_mode()) {
                this.set_quantity(this.get_quantity() + orderline.get_quantity() * -1);
            } else {
                _super_orderline.merge.call(this, orderline);
            }
        },
    });

    var _super_order = instance.point_of_sale.Order.prototype;
    instance.point_of_sale.Order = instance.point_of_sale.Order.extend({
        initialize: function(attributes){
            Backbone.Model.prototype.initialize.apply(this, arguments);
            this.pos = attributes.pos; 
            this.sequence_number = this.pos.pos_session.sequence_number++;
            this.uid =     this.generateUniqueId_barcode();     //this.generateUniqueId();
            this.set({
                creationDate:   new Date(),
                orderLines:     new instance.point_of_sale.OrderlineCollection(),
                paymentLines:   new instance.point_of_sale.PaymentlineCollection(),
                name:           _t("Order ") + this.uid, 
                client:         null,
                ret_o_id:       null,
                ret_o_ref:      null,
                sale_mode:      false,
                missing_mode:   false,
            });
            this.selected_orderline   = undefined;
            this.selected_paymentline = undefined;
            this.screen_data = {};  // see ScreenSelector
            this.receipt_type = 'receipt';  // 'receipt' || 'invoice'
            this.temporary = attributes.temporary || false;
            return this;
        },
//        initialize: function(attr) {
//            ret_o_id = null,
//            ret_o_ref = null,
//            sale_mode = false,
//            missing_mode = false,
//            this.uid = this.generateUniqueId_barcode();     //this.generateUniqueId();
//            _super_order.initialize.name = _t("Order ") + this.uid;
//            _super_order.initialize.apply(this,arguments);
//        },
        generateUniqueId_barcode: function() {
            return new Date().getTime();
        },
        
        // return order

        set_sale_mode: function(sale_mode) {
            this.set('sale_mode', sale_mode);
        },
        get_sale_mode: function() {
            return this.get('sale_mode');
        },
        set_missing_mode: function(missing_mode) {
            this.set('missing_mode', missing_mode);
        },
        get_missing_mode: function() {
            return this.get('missing_mode');
        },
        set_ret_o_id: function(ret_o_id) {
            this.set('ret_o_id', ret_o_id)
        },
        get_ret_o_id: function(){
            return this.get('ret_o_id');
        },
        set_ret_o_ref: function(ret_o_ref) {
            this.set('ret_o_ref', ret_o_ref)
        },
        get_ret_o_ref: function(){
            return this.get('ret_o_ref');
        },
        addProduct: function(product, options){
            options = options || {};
            var attr = JSON.parse(JSON.stringify(product));
            attr.pos = this.pos;
            attr.order = this;

            var is_sale_mode = this.get_sale_mode();
            var is_missing_mode = this.get_missing_mode();

            var retoid = this.pos.get('selectedOrder').get_ret_o_id();
            var order_ref = this.pos.get('selectedOrder').get_ret_o_ref() // to add backorder in line.
            if (retoid && !is_missing_mode) {
                var pids = [];
                new instance.web.Model("pos.order.line").get_func("search_read")
                                    ([['order_id', '=', retoid],['product_id', '=', attr.id],['return_qty', '>', 0]], 
                                    ['return_qty', 'id', 'price_unit', 'discount']).pipe(
                    function(result) {
                        if (result && result.length > 0  && !is_sale_mode) {
                            var return_qty = 0;
                            _.each(result, function(res) {
                                return_qty = return_qty + res.return_qty;
                            });
                            product['remaining_qty'] = return_qty
                            if (product.remaining_qty > 0 && selectedOrder.get_ret_o_id()) {
                                $("[data-product-id='"+product.id+"'] span.remaining-qty-tag").css('display', '');
                                $("[data-product-id='"+product.id+"'] span.remaining-qty-tag").html(product.remaining_qty);
                            } else {
                                $("[data-product-id='"+product.id+"'] span.remaining-qty-tag").css('display', 'none');
                            }
                            if (return_qty > 0) {
                                add_prod = true;
                                var added_item_count = 0;
                                (attr.order.get('orderLines')).each(_.bind( function(item) {
                                    if (attr.id == item.get_product().id && item.get_oid()) {
                                        added_item_count = added_item_count + (item.quantity * -1)
                                    }
                                    if (attr.id == item.get_product().id && return_qty <= added_item_count) {
                                        var error_str = _t('Can not return more products !');
                                        var error_dialog = new instance.web.Dialog(this, { 
                                            size: 'small',
                                            buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                                        }).open();
                                        error_dialog.$el.append(
                                            '<span id="error_str" style="font-size:18px;">' + error_str + '</span>');
                                        add_prod = false;
                                    }
                                }, self));
                                if (add_prod) {
                                    var line = new instance.point_of_sale.Orderline({}, {pos: attr.pos, order: this, product: product});
                                    line.set_oid(retoid);
                                    line.set_back_order(order_ref);
                                    if (result[0].discount) {
                                        line.set_discount(result[0].discount);
                                    }
                                    if(options.quantity !== undefined){
                                        line.set_quantity(options.quantity);
                                    }
                                    if(options.price !== undefined){
                                        line.set_unit_price(result[0].price_unit);
                                    }
                                    line.set_unit_price(result[0].price_unit);
                                    var last_orderline = attr.order.getLastOrderline();
                                    if( last_orderline && last_orderline.can_be_merged_with(line) && options.merge !== false){
                                        last_orderline.merge(line);
                                    }else{
                                        line.set_quantity(line.get_quantity() * -1)
                                        attr.order.get('orderLines').add(line);
                                    }
                                    attr.order.selectLine(attr.order.getLastOrderline());
                                }
                            } else {
                                var error_str = _t('Please check quantity of selected product & sold product !');
                                var error_dialog = new instance.web.Dialog(this, { 
                                    size: 'small',
                                    buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                                }).open();
                                error_dialog.$el.append(
                                    '<span id="error_str" style="font-size:18px;">' + error_str + '</span>');
                                return;
                            }
                    } else {
                        if (!is_sale_mode) {
                            var error_str = _t('Product is not in order list or try Sale Mode to add new products !');
                            var error_dialog = new instance.web.Dialog(this, { 
                                size: 'small',
                                buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                            }).open();
                            error_dialog.$el.append(
                                '<span id="error_str" style="font-size:18px;">' + error_str + '</span>');
                        } else {
                            var line = new instance.point_of_sale.Orderline({}, {pos: attr.pos, order: self, product: product});
                            if (retoid && retoid.toString() != 'Missing Receipt') {
                                line.set_oid(retoid);
                                line.set_back_order(order_ref);
                            }
                            if(options.quantity !== undefined){
                                line.set_quantity(options.quantity);
                            }
                            if(options.price !== undefined){
                                line.set_unit_price(options.price);
                            }
                            if(options.discount !== undefined){
                                line.set_discount(options.discount);
                            }
                            var last_orderline = attr.order.getLastOrderline();
                            if( last_orderline && last_orderline.can_be_merged_with(line) && options.merge !== false){
                                last_orderline.merge(line);
                            }else{
                                attr.order.get('orderLines').add(line);
                            }
                            attr.order.selectLine(attr.order.getLastOrderline());
                        }
                    }
                });
            } else if(is_missing_mode) {
                var line = new instance.point_of_sale.Orderline({}, {pos: attr.pos, order: self, product: product});
                if (retoid) {
                    line.set_oid(retoid);
                    line.set_back_order(order_ref);
                }
                if(options.quantity !== undefined){
                    line.set_quantity(options.quantity);
                }
                if(options.price !== undefined){
                    line.set_unit_price(options.price);
                }
                if(options.discount !== undefined){
                    line.set_discount(options.discount);
                }
                var last_orderline = this.getLastOrderline();
                if( last_orderline && last_orderline.can_be_merged_with(line) && options.merge !== false){
                    last_orderline.merge(line);
                }else{
                    line.set_quantity(line.get_quantity() * -1)
                    this.get('orderLines').add(line);
                }
                this.selectLine(this.getLastOrderline());
            } else {
                _super_order.addProduct.call(this, product, options);
            }
        },
        // exports a JSON for receipt printing
        export_for_printing: function(){
            var submitted_order_printing = _super_order.export_for_printing.call(this);
            $.extend(submitted_order, {'ret_o_id': this.get_ret_o_id});
        },
        export_as_JSON: function() {
            var submitted_order = _super_order.export_as_JSON.call(this);
            parent_return_order = '';
            var ret_o_id = this.get_ret_o_id();
            var ret_o_ref = this.get_ret_o_ref();
            var return_seq = 0;
            if (ret_o_id) {
                parent_return_order = this.get_ret_o_id();
            }
            backOrders = '';
            (this.get('orderLines')).each(_.bind( function(item) {
                if (item.get_back_order()) {
                    return backOrders += item.get_back_order() + ', ';
                }
            }, this));
            var new_val = {
                parent_return_order: parent_return_order, // Required to create paid return order
                return_seq: return_seq || 0,
                back_order: backOrders,
                sale_mode: this.get_sale_mode(),
            }
            $.extend(submitted_order, new_val);
            return submitted_order;
        },
    });
    
    var ReturnPaymentScreenWidget = instance.point_of_sale.PaymentScreenWidget.prototype;
    instance.point_of_sale.PaymentScreenWidget = instance.point_of_sale.PaymentScreenWidget.extend({
        validate_order: function(options) {
            var self = this;
            options = options || {};
            var currentOrder = this.pos.get('selectedOrder');
            
            ReturnPaymentScreenWidget.validate_order.call(this, options)
            currentOrder.set_ret_o_id('');
            currentOrder.set_sale_mode(true);
            currentOrder.set_missing_mode(false);
            $("span#sale_mode").css('background', 'blue');
            $("span#return_order").css('background', '');
            $("span#missing_return_order").css('background', '');
            $('#return_order_ref').html('');
            $('#return_order_number').val('');
            $("span.remaining-qty-tag").css('display', 'none');
        },
        wait: function( callback, seconds){
           return window.setTimeout( callback, seconds * 1000 );
        },
    });
    
    instance.point_of_sale.ReceiptScreenWidget = instance.point_of_sale.ReceiptScreenWidget.extend({
        wait: function( callback, seconds){
           return window.setTimeout( callback, seconds * 1000 );
        },
        print: function() {
            this.pos.get('selectedOrder')._printed = true;
            this.wait( function(){ window.print(); }, 2);
        },
    });
    
    instance.point_of_sale.OrderWidget.include({
        set_value: function(val) {
            var order = this.pos.get('selectedOrder');
            this.numpad_state = this.pos_widget.numpad.state;
            var mode = this.numpad_state.get('mode');
            if (this.editable && order.getSelectedLine()) {
                var ret_o_id = order.get_ret_o_id();
                if (ret_o_id) {
                    var prod_id = order.getSelectedLine().get_product().id;
                    if (order.get('orderLines').length !== 0) {
                        if( mode === 'quantity'){
                            var ret_o_id = order.get_ret_o_id();
                            if (ret_o_id && ret_o_id.toString() != 'Missing Receipt' && val != 'remove') {
                                var self = this;
                                var pids = [];
                                new instance.web.Model("pos.order.line").get_func("search_read")
                                                    ([['order_id', '=', ret_o_id],['product_id', '=', prod_id],['return_qty', '>', 0]], 
                                                    ['return_qty', 'id']).pipe(
                                    function(result) {
                                        if (result && result.length > 0) {
                                            if (result[0].return_qty > 0) {
                                                add_prod = true;
                                                (order.get('orderLines')).each(_.bind( function(item) {
                                                    if (prod_id == item.get_product().id && 
                                                        result[0].return_qty < parseInt(val)) {
                                                        var error_str = _t('Can not return more products !');
                                                        var error_dialog = new instance.web.Dialog(this, { 
                                                            size: 'small',
                                                            buttons: [{text: _t("Close"), click: function() { this.parents('.modal').modal('hide'); }}],
                                                        }).open();
                                                        error_dialog.$el.append(
                                                            '<span id="error_str" style="font-size:18px;">' + error_str + '</span>');
                                                        add_prod = false;
                                                    }
                                                }));
                                            }
                                            if (add_prod) {
                                                if (val != 'remove') {
	                                                order.getSelectedLine().set_quantity(parseInt(val) * -1);
	                                            } else {
	                                                order.getSelectedLine().set_quantity(val)
	                                            }
                                            }
                                        }
                                    }
                                );
                            } else {
                                order.getSelectedLine().set_quantity(val);
                            }
                        }else if( mode === 'discount'){
                            order.getSelectedLine().set_discount(val);
                        }else if( mode === 'price'){
                            order.getSelectedLine().set_unit_price(val);
                        }
                    } else {
                        this.pos.get('selectedOrder').destroy();
                    }
                } else {
                    this._super(val);
                }
            }
        },
    });
}
