'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Demos', href: '/demos' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-white w-full shadow-xs relative z-20">
      <div className="py-2 w-full flex items-center justify-end" style={{ minHeight: '4.5rem', paddingRight: '1.5rem' }}>
        <div className="flex items-center gap-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={classNames(
                'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                'rounded-md px-4 py-2 text-base font-medium transition-colors',
              )}
            >
              {item.name}
            </a>
          ))}
          <button
            type="button"
            className="relative rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View notifications</span>
            <BellIcon aria-hidden="true" className="size-7" />
          </button>
          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-2">
            <div>
              <MenuButton className="relative flex rounded-full bg-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="size-8 text-gray-500" aria-hidden="true" />
              </MenuButton>
            </div>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-none"
                >
                  Your Profile
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-none"
                >
                  Settings
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-none"
                >
                  Sign out
                </a>
              </MenuItem>
            </MenuItems>
          </Menu>
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
