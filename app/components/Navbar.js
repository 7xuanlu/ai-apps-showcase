'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {  BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import AuthButtons from './AuthButtons'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Demos', href: '/demos' },
  { name: 'Auth Demo', href: '/demo-auth' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-white w-full shadow-xs relative z-20">
      <div className="py-2 w-full flex items-center justify-between" style={{ minHeight: '4.5rem', paddingRight: '1.5rem', paddingLeft: '1.5rem' }}>
        <div className="flex items-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                'text-gray-500 hover:text-sky-600',
                'rounded-md px-4 py-2 text-lg font-medium transition-colors',
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-7" />
          </button>
          
          {/* Auth Buttons */}
          <AuthButtons />
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
