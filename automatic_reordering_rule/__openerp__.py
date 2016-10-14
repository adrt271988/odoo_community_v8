# -*- coding: utf-8 -*-
{
    'name': 'Automatic Reordering Rule',
    'version': '1.0',
    'website' : 'https://www.globalteckz.com',
    'category': 'Product',
    'summary': 'Automatic re-ordering rule on product creation',
    'description': """
Automatic re-ordering rule on product creation.
======================================

This module will create Automatic re-ordering rule on product creation

Key Features
------------
* User should not create Re-ordering rule each time he create a product
* If product is of type stockable, On its creation reordering rule will be created

""",
    'author': 'Globalteckz',
    'depends': ['base', 'sale', 'purchase', 'procurement','reorder_configuration'],
    'data': ['views/product_view.xml','wizard/create_reorder_rule.xml'],
    'demo': [],
    'test': [],
    'installable': True,
    'auto_install': False,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
