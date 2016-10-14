# -*- encoding: utf-8 -*-
##############################################################################
#    Copyright (c) 2012 - Present Acespritech Solutions Pvt. Ltd. All Rights Reserved
#    Author: <info@acespritech.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    A copy of the GNU General Public License is available at:
#    <http://www.gnu.org/licenses/gpl.html>.
#
##############################################################################
{
    'name': 'Product return from POS',
    'version': '1.0',
    'category': 'Point of Sale',
    'summary': 'Return products from Point of sale Interface.',
    'description': """
This module is used to return the products to the customer from POS Interface.
""",
    'author': "Acespritech Solutions Pvt. Ltd.",
    'website': "www.acespritech.com",
    'price': 215.00, 
    'currency': 'EUR',
    'images': ['static/images/main_screenshot.png'],
    'depends': ['web', 'point_of_sale', 'base'],
    'data': ['views/pos_return.xml',
             'pos_order/point_of_sale_view.xml'],
    'demo': [],
    'test': [],
    'qweb': ['static/src/xml/pos_return.xml'],
    'installable': True,
    'auto_install': False,
    'post_init_hook': 'set_default_values',
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4: