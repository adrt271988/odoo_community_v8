# -*- coding: utf-8 -*-

from openerp.osv import fields, osv



class stock_config_settings(osv.osv_memory):
    _inherit = 'stock.config.settings'
    _columns={
         'module_automatic_reordering_rule': fields.boolean('Automatic reordering rule for products', help='Install the Automatic reordering rule for products module which will help you set the Reordering Rules per product'),
              }
