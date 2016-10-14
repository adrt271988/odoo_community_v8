# -*- coding: utf-8 -*-
from openerp.osv import osv, fields
from openerp.tools.translate import _
from openerp import workflow
import openerp.addons.decimal_precision as dp

from openerp import tools, api
import csv
import cStringIO
import base64
import xlwt


class create_reorder_rule(osv.TransientModel):

    _name = 'create.reorder.rule'
    _descripton='Create Reorder rules As per selected Products or Categories'
    _columns = {
        'product_bool':fields.boolean('Product'),
        'category_bool':fields.boolean('Category'),
        'product_ids' : fields.many2many('product.product','product_id','reorder_id','product_reorder_relatn','Products'),
        'category_id' : fields.many2one('product.category','Category'),
        'qty_update': fields.boolean('Update with Quantity'),
        'min_qty': fields.float('Min Qty'),
        'max_qty': fields.float('Max Qty'),
        'qty_multiple': fields.float('Qty Multiple'),
        'done': fields.boolean('Done'),
    }

    _defaults = {
            'min_qty':0.00,
            'max_qty': 0.00,
            'qty_multiple': 1.00,
            'qty_update' : False,
    }
    
    
    def create_reorder_rules(self, cr, uid, ids, context=None):
        if context is None: context = {}
        product_obj=self.pool.get('product.product')
        order_point_obj = self.pool['stock.warehouse.orderpoint']
        wizard_obj = self.browse(cr,uid,ids)
        min_qty = max_qty = 0.00
        qty_multiple = 1.0
        if wizard_obj.product_bool or wizard_obj.category_bool:
            product_ids= self.browse(cr, uid, ids, context=context).product_ids
            if wizard_obj.category_bool:
                products_ids = product_obj.search(cr, uid, [('categ_id','=',wizard_obj.category_id.id)], context=context)
                product_ids = product_obj.browse(cr, uid, products_ids, context=context)
            for product_id in product_ids:
                if wizard_obj.qty_update:
                    min_qty = wizard_obj.min_qty
                    max_qty = wizard_obj.max_qty
                    qty_multiple = wizard_obj.qty_multiple or 1.0
                if product_id.type in ('product', 'consu'):
                    order_vals = {
                    'product_id':product_id.id,
                    'product_min_qty': min_qty,
                    'product_max_qty':max_qty,
                    'qty_multiple' : qty_multiple,
                    'active': True,
                    'product_uom': product_id.uom_id.id,
                    }
                    order_point_obj.create(cr, uid, order_vals, context=context)
                    self.browse(cr,uid,ids).write({'done':'True'})
        return True
            
        