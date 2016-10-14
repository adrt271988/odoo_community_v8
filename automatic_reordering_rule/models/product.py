# -*- coding: utf-8 -*-

from openerp.osv import fields, osv


class product_product(osv.osv):
	_name = 'product.product'
	_inherit = 'product.product'
	_columns={
			'auto_reorder':fields.boolean("Automatic Reordering rule",help="Click if you wish to create Automatic Reordering rule for this product",store=True)
			}
	def create(self, cr, uid, vals, context=None):
		if context is None:
		    context = {}
		ctx = dict(context or {}, create_product_product=True)

		order_point_obj = self.pool['stock.warehouse.orderpoint']
		if 'product_tmpl_id' in vals:
			tmpl_id=vals['product_tmpl_id']
			product_tmpl_obj=self.pool.get('product.template').browse(cr,uid,tmpl_id,context=context)
			if product_tmpl_obj.auto_reorder:
				vals.update({'auto_reorder':'True'})
				
		product_id = super(product_product, self).create(cr, uid, vals, context=ctx)
		product = self.browse(cr, uid, product_id, context=context)
		if product.type in ('product', 'consu') and product.auto_reorder:
			order_vals = {
			'product_id':product.id,
			'product_min_qty': 0.000,
			'product_max_qty':0.000,
			'qty_multiple' : 1.0,
			'active': True,
			'product_uom': product.uom_id.id,
			}
			order_point_obj.create(cr, uid, order_vals, context=context)
		return product_id
	
	def write(self,cr, uid,ids, vals, context=None):
		res=super(product_product,self).write(cr,uid,ids,vals,context=context)
		order_point_obj = self.pool['stock.warehouse.orderpoint']
		order_point_ids=order_point_obj.search(cr,uid,[('product_id','=',ids[0])])
		if 'auto_reorder' in vals:
			if vals['auto_reorder']:
				if self.browse(cr,uid,ids).type in ('product', 'consu') and not order_point_ids:
					vals = {
					'product_id':ids[0],
					'product_min_qty': 0.000,
					'product_max_qty':0.000,
					'qty_multiple' : 1.0,
					'active': True,
					'product_uom': self.browse(cr,uid,ids).uom_id.id,
					}
					order_point_obj.create(cr, uid, vals, context=context)
			return res


class product_template(osv.osv):
	_name = "product.template"
	_inherit = 'product.template'
	_columns={
			'auto_reorder':fields.boolean("Automatic Reordering rule",help="Click if you wish to create Automatic Reordering rule for this product")
			}

	
	def write(self,cr,uid,ids,vals,context=None):
		res=super(product_template,self).write(cr,uid,ids,vals,context=context)
		if 'auto_reorder' in vals:
			product_ids = self.pool.get('product.product').search(cr,uid,[('product_tmpl_id','=',ids[0])])
			product_id=self.pool.get('product.product').browse(cr,uid,product_ids[0])
			product_id.write(vals)
		return res